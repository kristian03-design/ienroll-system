<?php
echo "<h1>Email Verification Diagnostic Tool</h1>";
echo "<style>body{font-family:Arial,sans-serif;margin:20px;} .success{color:green;} .error{color:red;} .info{color:blue;}</style>";

// Test 1: PHP Version
echo "<h2>1. PHP Version Check</h2>";
echo "<p class='info'>PHP Version: " . phpversion() . "</p>";
if (version_compare(PHP_VERSION, '7.4.0') >= 0) {
    echo "<p class='success'>✅ PHP version is compatible</p>";
} else {
    echo "<p class='error'>❌ PHP version should be 7.4 or higher</p>";
}

// Test 2: Required Extensions
echo "<h2>2. Required Extensions</h2>";
$required_extensions = ['pdo', 'pdo_mysql', 'json'];
foreach ($required_extensions as $ext) {
    if (extension_loaded($ext)) {
        echo "<p class='success'>✅ $ext extension is loaded</p>";
    } else {
        echo "<p class='error'>❌ $ext extension is missing</p>";
    }
}

// Test 3: Database Connection
echo "<h2>3. Database Connection Test</h2>";
try {
    require_once 'config/database.php';
    $database = new Database();
    $db = $database->getConnection();
    echo "<p class='success'>✅ Database connection successful</p>";
    
    // Test if we can query
    $stmt = $db->query("SELECT 1");
    if ($stmt) {
        echo "<p class='success'>✅ Database queries working</p>";
    }
} catch (Exception $e) {
    echo "<p class='error'>❌ Database connection failed: " . $e->getMessage() . "</p>";
    echo "<p class='info'>💡 Make sure MySQL is running in XAMPP</p>";
}

// Test 4: Email Verification Table
echo "<h2>4. Email Verification Table</h2>";
try {
    if (isset($db)) {
        $stmt = $db->prepare("SHOW TABLES LIKE 'email_verification_codes'");
        $stmt->execute();
        if ($stmt->rowCount() > 0) {
            echo "<p class='success'>✅ Email verification table exists</p>";
        } else {
            echo "<p class='error'>❌ Email verification table does not exist</p>";
            echo "<p class='info'>💡 Run setup.php to create the table</p>";
        }
    }
} catch (Exception $e) {
    echo "<p class='error'>❌ Table check failed: " . $e->getMessage() . "</p>";
}

// Test 5: File Permissions
echo "<h2>5. File Permissions</h2>";
$logs_dir = __DIR__ . '/logs';
if (is_dir($logs_dir)) {
    echo "<p class='success'>✅ Logs directory exists</p>";
    if (is_writable($logs_dir)) {
        echo "<p class='success'>✅ Logs directory is writable</p>";
    } else {
        echo "<p class='error'>❌ Logs directory is not writable</p>";
    }
} else {
    echo "<p class='info'>📁 Logs directory does not exist (will be created automatically)</p>";
}

// Test 6: API File Existence
echo "<h2>6. API Files</h2>";
$api_files = [
    'api/email_verification.php',
    'api/student_registration.php',
    'config/database.php'
];

foreach ($api_files as $file) {
    if (file_exists($file)) {
        echo "<p class='success'>✅ $file exists</p>";
    } else {
        echo "<p class='error'>❌ $file is missing</p>";
    }
}

// Test 7: Test API Directly
echo "<h2>7. API Functionality Test</h2>";
try {
    if (isset($db)) {
        // Include the API class
        require_once 'api/email_verification.php';
        $api = new EmailVerificationApi($db);
        
        $testData = ['email' => 'test@example.com'];
        $result = $api->sendVerificationCode($testData);
        
        if ($result['success']) {
            echo "<p class='success'>✅ API test successful</p>";
            if (isset($result['data']['code'])) {
                echo "<p class='info'>📧 Test verification code: <strong>" . $result['data']['code'] . "</strong></p>";
            }
        } else {
            echo "<p class='error'>❌ API test failed: " . $result['message'] . "</p>";
        }
    }
} catch (Exception $e) {
    echo "<p class='error'>❌ API test exception: " . $e->getMessage() . "</p>";
}

// Test 8: Log File Creation
echo "<h2>8. Log File Test</h2>";
try {
    $logFile = __DIR__ . '/logs/email_verification.log';
    $logDir = dirname($logFile);
    
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
        echo "<p class='info'>📁 Created logs directory</p>";
    }
    
    $testLog = "Test log entry: " . date('Y-m-d H:i:s') . "\n";
    if (file_put_contents($logFile, $testLog, FILE_APPEND | LOCK_EX)) {
        echo "<p class='success'>✅ Log file is writable</p>";
    } else {
        echo "<p class='error'>❌ Cannot write to log file</p>";
    }
} catch (Exception $e) {
    echo "<p class='error'>❌ Log test failed: " . $e->getMessage() . "</p>";
}

echo "<h2>Summary</h2>";
echo "<p class='info'>If you see any ❌ errors above, fix them before testing the email verification.</p>";
echo "<p class='info'>For development testing, the verification code will be included in the API response.</p>";
echo "<p class='info'>Check the browser's Network tab to see the actual verification code.</p>";

echo "<h2>Next Steps</h2>";
echo "<ol>";
echo "<li>Fix any errors shown above</li>";
echo "<li>Run the test: <a href='test_email_api.php'>test_email_api.php</a></li>";
echo "<li>Try the registration form and check browser Network tab</li>";
echo "<li>Check logs/email_verification.log for verification codes</li>";
echo "</ol>";
?>
