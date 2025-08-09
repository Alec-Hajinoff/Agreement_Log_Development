<?php
// Call to api.openweathermap.org to fetch weather data
ini_set('display_errors', 'On');
error_reporting(E_ALL);
$executionStartTime = microtime(true);

require_once 'session_config.php';

try {
    $pdo = new PDO('mysql:host=localhost;dbname=climate_bind', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

    // Fetches all rows from the 'policies' table & wallet address from the 'users' table & comparison operator and threashold value from 'triggers' table
    $stmt = $pdo->query('SELECT p.id, p.policy_latitude, p.policy_longitude, p.payout_amount, u.wallet,
                         t.comparison_operator, t.threshold_value
                         FROM policies p 
                         LEFT JOIN users u ON u.policies_id = p.id
                         LEFT JOIN triggers t ON t.policies_id = p.id');
    $policies = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Runs a comparison based on the operator from the database
    function compareValues($value1, $operator, $value2)
    {
        switch ($operator) {
            case '>':
                return $value1 > $value2;
            case '<':
                return $value1 < $value2;
            case '>=':
                return $value1 >= $value2;
            case '<=':
                return $value1 <= $value2;
            case '=':
                return $value1 == $value2;
            default:
                return false;
        }
    }

    foreach ($policies as $policy) {
        $policyId = $policy['id']; // We need id to insert data into correct rows of 'readings' table
        $latitude = $policy['policy_latitude'];
        $longitude = $policy['policy_longitude'];
        $walletAddress = $policy['wallet']; // The wallet is needed as it's being passed into claimPayout() to payout to the right user
        $payoutAmount = $policy['payout_amount']; // Payout amount from database for the registerPayout() function to queue a payout
        $comparisonOperator = $policy['comparison_operator']; // Comparison operator from the triggers table
        $thresholdValue = $policy['threshold_value']; // Threshold value from the triggers table

        // Updates the API URL with fetched latitude and longitude
        $url = 'https://api.openweathermap.org/data/2.5/weather?lat=' . $latitude . '&lon=' . $longitude . '&appid=5b25b2d29d964e323a4673212fa148e5';

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_URL, $url);
        $result = curl_exec($ch);
        curl_close($ch);

        $decode = json_decode($result, true);
        $tempKelvin = $decode['main']['temp'];
        $tempCelsius = $tempKelvin - 273.15;

        // Deletes old temperature values from database table 'readings'
        $deleteStmt = $pdo->prepare('DELETE FROM readings WHERE policies_id = :policyId');
        $deleteStmt->bindParam(':policyId', $policyId);
        $deleteStmt->execute();

        // Inserts new temperature values into database table 'readings'
        $stmt = $pdo->prepare('INSERT INTO readings (value, policies_id, timestamp) VALUES (:temperature, :policyId, NOW())');
        $stmt->bindParam(':temperature', $tempCelsius);
        $stmt->bindParam(':policyId', $policyId);
        $stmt->execute();

        // Trigger payout if temperature is above threshold
        // This will trigger the contract for each row in the 'policies' table where the condition is met
        if (compareValues($tempCelsius, $comparisonOperator, $thresholdValue) && $walletAddress !== null && $payoutAmount !== null) {
            $nodeApiUrl = 'http://localhost:3000/trigger-payout';
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $nodeApiUrl);
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
                'address' => $walletAddress,
                'amount' => $payoutAmount
            ]));
            curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
            $result = curl_exec($ch);
            curl_close($ch);

            $response = json_decode($result, true);
            if ($response['status'] !== 'success') {
                error_log("Payout trigger failed: " . $response['message']);
            } else {
                // Update database columns 'policy_paid_out' & 'paid_out_timestamp' after successful contract call
                $updateStmt = $pdo->prepare("
                    UPDATE policies
                    SET policy_paid_out = 1,
                        paid_out_timestamp = NOW()
                    WHERE id = :policyId
                ");
                $updateStmt->bindParam(':policyId', $policyId);
                $updateStmt->execute();
            }
        }
    }

    $output = array(
        'status' => 'success',
        'message' => 'Temperature data processed for all policies'
    );
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode($output);
} catch (PDOException $e) {
    $output = array(
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage()
    );
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode($output);
} finally {
    $pdo = null;
}
?>