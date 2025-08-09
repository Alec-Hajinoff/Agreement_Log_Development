<?php
// This file sends updated premium amount and payout amount to the front end when a user selects their coordinates and event type.
// The corresponding front end file is ClaimDataCapture.js
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

    $data = json_decode(file_get_contents('php://input'), true);
    $event = $data['event'] ?? '';
    $latitude = $data['latitude'] ?? null;
    $longitude = $data['longitude'] ?? null;

    if ($event && $latitude !== null && $longitude !== null) {
        $stmt = $pdo->prepare('
            SELECT cp.premium_amount, cp.payout_amount, l.latitude_min, l.longitude_min, l.latitude_max, l.longitude_max
            FROM cover_pricing cp
            JOIN locations l ON cp.location_id = l.id
            WHERE cp.event_type = ?
        ');
        $stmt->execute([$event]);
        $pricings = $stmt->fetchAll(PDO::FETCH_ASSOC); // Fetch all matching rows

        $found = false;
        foreach ($pricings as $pricing) {
            // Check if the latitude and longitude are within the specified bounds
            if (
                $latitude > $pricing['latitude_min'] && $latitude < $pricing['latitude_max'] &&
                $longitude > $pricing['longitude_min'] && $longitude < $pricing['longitude_max']
            ) {
                echo json_encode([
                    'status' => 'success',
                    'payout' => $pricing['payout_amount'],
                    'premium' => $pricing['premium_amount']
                ]);
                $found = true;
                break; // Exit the loop once a match is found
            }
        }

        if (!$found) {
            echo json_encode([
                'status' => 'error',
                'message' => 'We currently do not offer insurance for your location, apologies!'
            ]);
        }
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'Event type, latitude, and longitude are required'
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
?>