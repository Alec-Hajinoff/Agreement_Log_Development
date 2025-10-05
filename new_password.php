<?php

// This file validates a password reset token and updates the user's password if token and expiry are both valid.

require_once 'session_config.php';

$allowed_origins = [
    "https://agreementlog.com",
    "https://www.agreementlog.com"
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header("HTTP/1.1 403 Forbidden");
    exit;
}

header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (isset($input['token']) && isset($input['newPassword'])) {
    $token = trim($input['token']);
    $newPassword = $input['newPassword'];

    // Basic validation for password (at least 8 characters, as per React component)
    if (strlen($newPassword) < 8) {
        echo json_encode(['status' => 'error', 'message' => 'Password must be at least 8 characters long']);
        exit;
    }

    try {
        $pdo = new PDO("mysql:host=localhost;port=3306;dbname=agreement_log", "agreement_log_user", "em6JmMah3YCXFXr", [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]);

        $pdo->beginTransaction();

        $stmt = $pdo->prepare('SELECT id FROM users WHERE reset_token = ? AND NOW() < token_expiry');
        $stmt->execute([$token]);

        $user = $stmt->fetch();

        if ($user) {
            // Hash the new password
            $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

            // Update password and clear/reset token fields
            $updateStmt = $pdo->prepare('UPDATE users SET password = ?, reset_token = NULL, token_expiry = NULL WHERE id = ?');
            $updateStmt->execute([$hashedPassword, $user['id']]);

            $pdo->commit();
            echo json_encode(['status' => 'success', 'message' => 'Password reset successfully']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Invalid or expired token']);
        }
    } catch (PDOException $e) {
        if (isset($pdo)) {
            $pdo->rollBack();
        }
        file_put_contents('error_log.txt', $e->getMessage() . PHP_EOL, FILE_APPEND);
        echo json_encode(['status' => 'error', 'message' => 'An error occurred. Please try again.']);
    } finally {
        $pdo = null;
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Token and new password are required']);
}
