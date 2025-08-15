<?php

// This file is the database call to send the agreement text submitted by the user to the database.

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

$env = parse_ini_file(__DIR__ . '/.env'); // We are picking up the encryption key from .env to encrypt the agreement text.
$encryption_key = $env['ENCRYPTION_KEY'];

$servername = "127.0.0.1";
$username = "root";
$passwordServer = "";
$dbname = "agreement_log";

try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $passwordServer);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
} catch (PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}

$json = file_get_contents('php://input');
$data = json_decode($json, true);
$id = $_SESSION['id'] ?? null;
$agreement_text = $data['agreement_text'] ?? null;

if (!$id || !$agreement_text) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

try {
    $conn->beginTransaction();

    $agreement_hash = hash('sha256', $agreement_text); // Uses PHP’s built-in hash() function to compute a cryptographic hash using the SHA-256 algorithm.

    $sql = "INSERT INTO agreements (agreement_text, agreement_hash, user_id) VALUES (AES_ENCRYPT(?, ?), ?, ?)"; // AES_ENCRYPT() is a built-in MySQL function for encrypting.
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception('Failed to prepare agreement insert statement');
    }

    $stmt->bindParam(1, $agreement_text);
    $stmt->bindParam(2, $encryption_key);
    $stmt->bindParam(3, $agreement_hash);
    $stmt->bindParam(4, $id);
    $stmt->execute();

    $conn->commit();

    echo json_encode([
        'success' => true,
        'hash' => $agreement_hash
    ]);
} catch (Exception $e) {
    $conn->rollBack();
    echo json_encode(['success' => false, 'message' => 'Transaction failed: ' . $e->getMessage()]);
} finally {
    $conn = null;
}