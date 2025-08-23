<?php

// The user clicks 'Start Policy' in the UI and this file sends to the database a boolean true - the agreement is counter signed.

require_once 'session_config.php';

$allowed_origins = [
    "http://localhost:3000"
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header("HTTP/1.1 403 Forbidden");
    exit;
}

header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}

try {
    $pdo = new PDO("mysql:host=127.0.0.1;dbname=agreement_log", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

    $data = json_decode(file_get_contents('php://input'), true);
    $hash = $data['hash'] ?? null;
    $userName = $data['userName'] ?? null;

    if (!$hash) {
        echo json_encode(['success' => false, 'message' => 'Missing hash']);
        exit;
    }

    if (!$userName) {
        echo json_encode(['success' => false, 'message' => 'Missing user name']);
        exit;
    }

    $stmt = $pdo->prepare("UPDATE agreements SET counter_signed = 1, countersigner_name = ?, countersigned_timestamp = NOW() WHERE agreement_hash = ?");
    $result = $stmt->execute([$userName, $hash]);

    if ($result && $stmt->rowCount() > 0) { // rowCount() returns the number of rows affected by the last DELETE, INSERT, or UPDATE statement. In this case it simply checks that counter_signed = 1 before calling the Express server.

        $timestampStmt = $pdo->prepare("SELECT UNIX_TIMESTAMP(countersigned_timestamp) as unix_timestamp FROM agreements WHERE agreement_hash = ?");
        $timestampStmt->execute([$hash]);
        $timestamp = $timestampStmt->fetch(PDO::FETCH_ASSOC)['unix_timestamp'];

        $ch = curl_init("http://localhost:8002/call-express"); // Here we are calling the Express server at server.js which will call pushOnchain.js to publish the hash on chain.  
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
            'agreementHash' => $hash,
            'timestamp' => intval($timestamp)  // Convert to integer and send timestamp
        ]));

        $response = curl_exec($ch);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($curlError) {
            echo json_encode(['success' => false, 'message' => 'Blockchain service error: ' . $curlError]);
            exit;
        }

        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Agreement not found or already signed']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
} finally {
    $pdo = null;
}
