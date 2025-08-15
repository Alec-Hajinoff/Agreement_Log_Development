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

    if (!$hash) {
        echo json_encode(['success' => false, 'message' => 'Missing hash']);
        exit;
    }

    $stmt = $pdo->prepare("UPDATE agreements SET counter_signed = 1 WHERE agreement_hash = ?");
    $result = $stmt->execute([$hash]);

    if ($result && $stmt->rowCount() > 0) { // rowCount() returns the number of rows affected by the last DELETE, INSERT, or UPDATE statement. In this case it simply checks that counter_signed = 1 before calling the Express server.
        $ch = curl_init("http://localhost:8002/trigger-payout"); // Here we are calling the Express server at server.js which will call triggerClaim.js to publish the hash on chain.  
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['agreementHash' => $hash]));

        $response = curl_exec($ch);
        $curlError = curl_error($ch);
        curl_close($ch);
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Agreement not found or already signed']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
} finally {
    $pdo = null;
}
