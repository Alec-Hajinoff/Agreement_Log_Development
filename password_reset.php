<?php

// This file checks an email address exists in the database and if so sends a password reset email. 

require_once 'session_config.php';
require 'vendor/autoload.php';  // Ensure PHPMailer is installed via Composer

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

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

header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$env = parse_ini_file(__DIR__ . '/.env');
$username = $env['USERNAME'];
$password = $env['PASSWORD'];


if (isset($input['email'])) {
    $email = filter_var(trim($input['email']), FILTER_SANITIZE_EMAIL);
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid email format']);
        exit;
    }
    try {
        $pdo = new PDO('mysql:host=localhost;dbname=agreement_log', 'root', '', [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]);

        $pdo->beginTransaction();

        $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if ($user) {
            // The below two lines generate secure token and expiry
            $token = bin2hex(random_bytes(32));
            $expiry = date('Y-m-d H:i:s', strtotime('+2 hours'));

            // Store token and expiry in DB
            $updateStmt = $pdo->prepare('UPDATE users SET reset_token = ?, token_expiry = ? WHERE email = ?');
            $updateStmt->execute([$token, $expiry, $email]);

            // Send reset email
            $mail = new PHPMailer(true);
            try {
                $mail->isSMTP();
                $mail->Host = 'smtp.gmail.com';  // Replace with SMTP host (e.g., smtp.gmail.com)
                $mail->SMTPAuth = true;
                $mail->Username = $username;  // Replace with my actual email
                $mail->Password = $password;  // Replace with generated app password
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
                $mail->Port = 587;

                $mail->setFrom($username, 'Agreement Log');  // Replace with my actual email
                $mail->addAddress($email);

                $mail->isHTML(true);
                $mail->Subject = 'Password Reset Request';
                $resetLink = "http://localhost:3000/reset-password?token=$token";  // Reset URL being send to the user
                $mail->Body = "Click the link to reset your Agreement Log password: <a href='$resetLink'>$resetLink</a>. This link expires in 1 hour.";

                $mail->send();
            } catch (Exception $e) {
                // Log email sending error but do not fail the request
                file_put_contents('error_log.txt', 'Email send error: ' . $mail->ErrorInfo . PHP_EOL, FILE_APPEND);
            }
        }
        // Always return success, regardless of user existence or email send status
        $pdo->commit();
        echo json_encode(['status' => 'success']);
    } catch (PDOException $e) {
        if (isset($pdo)) {
            $pdo->rollBack();
        }
        file_put_contents('error_log.txt', $e->getMessage() . PHP_EOL, FILE_APPEND);
        // Even on DB error, return success to avoid revealing info
        echo json_encode(['status' => 'success']);
    } finally {
        $pdo = null;
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Email is required']);
}
