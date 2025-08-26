<?php
// Test the email verification API
echo "<h2>Testing Email Verification API</h2>";

// Test 1: Check if database connection works
echo "<h3>Test 1: Database Connection</h3>";
try {
    require_once 'config/database.php';
    $database = new Database();
    $db = $database->getConnection();
    echo "✅ Database connection successful<br>";
} catch (Exception $e) {
    echo "❌ Database connection failed: " . $e->getMessage() . "<br>";
    exit;
}

// Test 2: Check if email verification table exists
echo "<h3>Test 2: Email Verification Table</h3>";
try {
    $stmt = $db->prepare("SHOW TABLES LIKE 'email_verification_codes'");
    $stmt->execute();
    if ($stmt->rowCount() > 0) {
        echo "✅ Email verification table exists<br>";
    } else {
        echo "❌ Email verification table does not exist<br>";
        // Try to create it
        $sql = "CREATE TABLE IF NOT EXISTS email_verification_codes (
            id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(100) NOT NULL,
            verification_code VARCHAR(6) NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            is_used TINYINT(1) NOT NULL DEFAULT 0,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_email_code (email, verification_code),
            INDEX idx_expires (expires_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
        $db->exec($sql);
        echo "✅ Created email verification table<br>";
    }
} catch (Exception $e) {
    echo "❌ Table check failed: " . $e->getMessage() . "<br>";
}

// Test 3: Test the API directly
echo "<h3>Test 3: API Test</h3>";
$testEmail = "test@example.com";
$testData = ['email' => $testEmail];

// Include the API class
require_once 'api/email_verification.php';

try {
    $api = new EmailVerificationApi($db);
    $result = $api->sendVerificationCode($testData);
    
    if ($result['success']) {
        echo "✅ API test successful<br>";
        echo "Message: " . $result['message'] . "<br>";
    } else {
        echo "❌ API test failed<br>";
        echo "Error: " . $result['message'] . "<br>";
    }
} catch (Exception $e) {
    echo "❌ API test exception: " . $e->getMessage() . "<br>";
}

echo "<h3>Test Complete</h3>";
echo "<p>Check your PHP error log for any additional errors.</p>";
?>
