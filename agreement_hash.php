<?php

// Checks the hash in the database, as the user types it - when that matches React displays the agreement text in the UI.

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

$env = parse_ini_file(__DIR__ . '/.env'); // We are picking up the encryption key from .env to dencrypt the agreement text.
$encryption_key = $env['ENCRYPTION_KEY'];

try {
    $pdo = new PDO("mysql:host=127.0.0.1;dbname=agreement_log", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

    $data = json_decode(file_get_contents('php://input'), true);
    $hash = $data['hash'] ?? '';

    // The AES_DECRYPT() in the if statement below is a built-in MySQL function for decrypting.

    if ($hash) {
        $stmt = $pdo->prepare('
            SELECT AES_DECRYPT(agreement_text, ?) as decrypted_text 
            FROM agreements 
            WHERE agreement_hash = ?
        ');
        $stmt->execute([$encryption_key, $hash]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($result && $result['decrypted_text']) {
            echo json_encode([
                'status' => 'success',
                'agreementText' => mb_convert_encoding($result['decrypted_text'], 'UTF-8', 'ISO-8859-1')
            ]);
        } else {
            echo json_encode([
                'status' => 'error',
                'message' => 'Agreement not found'
            ]);
        }
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'Hash is required'
        ]);
    }
} catch (PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage()
    ]);
} finally {
    $pdo = null;
}
