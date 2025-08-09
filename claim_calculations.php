<?php

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
    $pdo = new PDO('mysql:host=localhost;dbname=climate_bind', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

    $pdo->beginTransaction();
    // Brings data from database to be dislayed on this page http://localhost:3000/SubmittedClaim
    $stmt = $pdo->prepare('SELECT p.premium_amount, p.payout_amount, t.comparison_operator, 
                          t.event_type, t.threshold_value, t.threshold_unit,
                          CASE 
                            WHEN r.value IS NULL THEN "To be displayed 30 days after start of contract"
                            ELSE r.value 
                            END as reading_value, 
                          CASE
                            WHEN p.policy_paid_out = 1 THEN p.payout_amount
                            ELSE 0
                            END AS resolved_payout
                          FROM policies p 
                          INNER JOIN users u ON u.policies_id = p.id 
                          INNER JOIN triggers t ON t.policies_id = p.id 
                          LEFT JOIN readings r ON r.policies_id = p.id 
                          WHERE u.id = ?');

    // In 'END as reading_value' the 'reading_value' is what we send to the frontend (the outcome of the condition).

    $stmt->execute([$_SESSION['id']]);
    $policies = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $pdo->commit();

    header('Content-Type: application/json');
    echo json_encode($policies);
} catch (PDOException $e) {
    if (isset($pdo)) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
} finally {
    $pdo = null;
}

?>