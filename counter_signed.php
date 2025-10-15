<?php

// The user clicks 'Start Policy' in the UI and this file sends to the database a boolean true - the agreement is counter signed.

require_once 'session_config.php';

$allowed_origins = [
    'http://localhost:3000',
    'https://agreement-log.fly.dev'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header('HTTP/1.1 403 Forbidden');
    exit;
}

header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}

try {
    $pdo = new PDO('mysql:host=127.0.0.1;dbname=agreement_log', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

    // Fetch AES key so we can decrypt the agreement when responding
    $env = parse_ini_file(__DIR__ . '/.env');
    $encryptionKey = $env['ENCRYPTION_KEY'] ?? null;
    if (!$encryptionKey) {
        throw new Exception('Encryption key is not configured');
    }

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

    $stmt = $pdo->prepare('UPDATE agreements SET counter_signed = 1, countersigner_name = ?, countersigned_timestamp = NOW() WHERE agreement_hash = ?');
    $result = $stmt->execute([$userName, $hash]);

    if ($result && $stmt->rowCount() > 0) {  // rowCount() returns the number of rows affected by the last DELETE, INSERT, or UPDATE statement. In this case it simply checks that counter_signed = 1 before calling the Express server.

        $timestampStmt = $pdo->prepare('SELECT UNIX_TIMESTAMP(countersigned_timestamp) as unix_timestamp FROM agreements WHERE agreement_hash = ?');
        $timestampStmt->execute([$hash]);
        $timestamp = $timestampStmt->fetch(PDO::FETCH_ASSOC)['unix_timestamp'];

        $ch = curl_init('https://agreement-log.fly.dev/call-express');  // Here we are calling the Express server installed on fly.io (see folder fly-deployment), server.js will call pushOnchain.js to publish the hash on chain.
        // If the Express server is running locally, call http://localhost:8002/call-express
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

        $agreementStmt = $pdo->prepare(
            'SELECT 
                agreement_hash,
                CONVERT(AES_DECRYPT(agreement_text, ?) USING utf8mb4) AS decrypted_text,
                countersigned_timestamp
             FROM agreements
             WHERE agreement_hash = ?'
        );
        $agreementStmt->execute([$encryptionKey, $hash]);
        $agreementRow = $agreementStmt->fetch(PDO::FETCH_ASSOC);

        if (!$agreementRow) {
            // Guard against missing data so the frontend doesn't receive an empty payload
            echo json_encode(['success' => false, 'message' => 'Unable to locate agreement record for download']);
            exit;
        }

        $agreementText = $agreementRow['decrypted_text'] ?? '';

        if (!mb_check_encoding($agreementText, 'UTF-8')) {
            // Keep the same UTF-8 safeguards used on insert
            $agreementText = mb_convert_encoding($agreementText, 'UTF-8', 'auto');
        }

        if (class_exists('Normalizer')) {
            $agreementText = Normalizer::normalize($agreementText, Normalizer::FORM_C);
        }

        $timestampValue = $agreementRow['countersigned_timestamp'] ?? null;
        $formattedTimestamp = null;

        if ($timestampValue) {
            // Format the timestamp so it renders nicely inside the PDF
            $countersignedAt = new DateTime($timestampValue);
            $formattedTimestamp = $countersignedAt->format('Y-m-d H:i:s');
        }

        echo json_encode([
            'success' => true,
            'blockchainResponse' => json_decode($response, true) ?? $response,
            'downloadData' => [
                'agreementHash' => $agreementRow['agreement_hash'],
                'agreementText' => $agreementText,
                'countersignedTimestamp' => $formattedTimestamp
            ]
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Agreement not found or already signed']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
} finally {
    $pdo = null;
}
