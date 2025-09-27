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
// Capture and validate the category sent from frontend
$category = isset($data['category']) ? trim($data['category']) : null;
// Allow list of valid categories
$allowedCategories = ['Clients', 'Suppliers', 'Operations', 'HR', 'Marketing', 'Finance', 'Other'];
$needs_signature = $data['needs_signature'] ?? null;
$agreement_tag = $data['agreement_tag'] ?? null; // New field for agreement tag

if (!$id || !$agreement_text || !$category) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

// Validate category against allow list
if (!in_array($category, $allowedCategories, true)) {
    echo json_encode(['success' => false, 'message' => 'Invalid category']);
    exit;
}

// Check if agreement_tag is required but not provided
if ($needs_signature == 0 && empty($agreement_tag)) {
    echo json_encode(['success' => false, 'message' => 'Agreement tag is required when signature is not needed']);
    exit;
}

try {
    $conn->beginTransaction();

    $agreement_hash = hash('sha256', $agreement_text); // Uses PHP's built-in hash() function to compute a cryptographic hash using the SHA-256 algorithm.

    // Update SQL to include agreement_tag
    if ($needs_signature == 0 && !empty($agreement_tag)) {
        // Include agreement_tag in the insert when signature is not needed
        $sql = "INSERT INTO agreements (agreement_text, agreement_hash, user_id, category, needs_signature, agreement_tag, countersigned_timestamp) 
                VALUES (AES_ENCRYPT(?, ?), ?, ?, ?, ?, AES_ENCRYPT(?, ?), UNIX_TIMESTAMP())";
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception('Failed to prepare agreement insert statement');
        }

        $stmt->bindParam(1, $agreement_text);
        $stmt->bindParam(2, $encryption_key);
        $stmt->bindParam(3, $agreement_hash);
        $stmt->bindParam(4, $id);
        $stmt->bindParam(5, $category);
        $stmt->bindParam(6, $needs_signature);
        $stmt->bindParam(7, $agreement_tag);
        $stmt->bindParam(8, $encryption_key);
    } else {
        // Don't include agreement_tag when signature is needed
        $sql = "INSERT INTO agreements (agreement_text, agreement_hash, user_id, category, needs_signature) 
                VALUES (AES_ENCRYPT(?, ?), ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception('Failed to prepare agreement insert statement');
        }

        $stmt->bindParam(1, $agreement_text);
        $stmt->bindParam(2, $encryption_key);
        $stmt->bindParam(3, $agreement_hash);
        $stmt->bindParam(4, $id);
        $stmt->bindParam(5, $category);
        $stmt->bindParam(6, $needs_signature);
    }

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


/*
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
// Capture and validate the category sent from frontend
$category = isset($data['category']) ? trim($data['category']) : null;
// Allow list of valid categories
$allowedCategories = ['Clients', 'Suppliers', 'Operations', 'HR', 'Marketing', 'Finance', 'Other'];


if (!$id || !$agreement_text || !$category) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

// Validate category against allow list
if (!in_array($category, $allowedCategories, true)) {
    echo json_encode(['success' => false, 'message' => 'Invalid category']);
    exit;
}

try {
    $conn->beginTransaction();

    $agreement_hash = hash('sha256', $agreement_text); // Uses PHP’s built-in hash() function to compute a cryptographic hash using the SHA-256 algorithm.

    $sql = "INSERT INTO agreements (agreement_text, agreement_hash, user_id, category) VALUES (AES_ENCRYPT(?, ?), ?, ?, ?)"; // AES_ENCRYPT() is a built-in MySQL function for encrypting.
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception('Failed to prepare agreement insert statement');
    }

    $stmt->bindParam(1, $agreement_text);
    $stmt->bindParam(2, $encryption_key);
    $stmt->bindParam(3, $agreement_hash);
    $stmt->bindParam(4, $id);
    $stmt->bindParam(5, $category);

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
*/
