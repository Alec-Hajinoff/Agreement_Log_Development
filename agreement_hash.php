<?php

// Checks the hash in the database, as the user types it - when that matches React displays the agreement text in the UI.

require_once 'session_config.php';

$allowed_origins = [
    'https://agreementlog.com',
    'https://www.agreementlog.com'
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

$env = parse_ini_file(__DIR__ . '/.env');  // We are picking up the encryption key from .env to dencrypt the agreement text.
$encryption_key = $env['ENCRYPTION_KEY'];

try {
    $pdo = new PDO('mysql:host=localhost;port=3306;dbname=agreement_log', 'agreement_log_user', 'em6JmMah3YCXFXr');
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
            AND needs_signature = 1
        ');
        $stmt->execute([$encryption_key, $hash]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($result && $result['decrypted_text']) {
            $decrypted_text = $result['decrypted_text'];

            // Ensure the decrypted text is valid UTF-8
            if (!mb_check_encoding($decrypted_text, 'UTF-8')) {
                $decrypted_text = mb_convert_encoding($decrypted_text, 'UTF-8', 'auto');
            }

            // Normalise to Unicode form for consistent rendering
            if (class_exists('Normalizer')) {
                $decrypted_text = Normalizer::normalize($decrypted_text, Normalizer::FORM_C);
            }

            // Return clean UTF-8 JSON without escaping Unicode characters
            echo json_encode([
                'status' => 'success',
                'agreementText' => $decrypted_text
            ], JSON_UNESCAPED_UNICODE);
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
