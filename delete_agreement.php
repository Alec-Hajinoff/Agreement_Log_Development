<?php

// This file handles the deletion of agreements from the database.

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

$servername = 'localhost';
$username = 'agreement_log_user';
$passwordServer = 'em6JmMah3YCXFXr';
$dbname = 'agreement_log';

try {
    $conn = new PDO("mysql:host=$servername;port=3306;dbname=$dbname", $username, $passwordServer);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
} catch (PDOException $e) {
    die('Connection failed: ' . $e->getMessage());
}

$json = file_get_contents('php://input');
$data = json_decode($json, true);
$hash = $data['hash'] ?? null;
$id = $_SESSION['id'] ?? null;

if (!$hash || !$id) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

try {
    $conn->beginTransaction();

    // First verify the agreement belongs to the user
    $check_sql = 'SELECT user_id FROM agreements WHERE agreement_hash = ?';
    $check_stmt = $conn->prepare($check_sql);
    if (!$check_stmt) {
        throw new Exception('Failed to prepare check statement');
    }

    $check_stmt->bindParam(1, $hash);
    $check_stmt->execute();
    $result = $check_stmt->fetch(PDO::FETCH_ASSOC);

    if (!$result || $result['user_id'] != $id) {
        echo json_encode(['success' => false, 'message' => 'Agreement not found or access denied']);
        exit;
    }

    // Delete the agreement
    $delete_sql = 'DELETE FROM agreements WHERE agreement_hash = ? AND user_id = ?';
    $delete_stmt = $conn->prepare($delete_sql);
    if (!$delete_stmt) {
        throw new Exception('Failed to prepare delete statement');
    }

    $delete_stmt->bindParam(1, $hash);
    $delete_stmt->bindParam(2, $id);
    $delete_stmt->execute();

    if ($delete_stmt->rowCount() == 0) {
        throw new Exception('No agreement was deleted');
    }

    $conn->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Agreement deleted successfully'
    ]);
} catch (Exception $e) {
    $conn->rollBack();
    echo json_encode(['success' => false, 'message' => 'Transaction failed: ' . $e->getMessage()]);
} finally {
    $conn = null;
}
