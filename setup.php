<?php
/**
 * School Enrollment Management System Setup Script
 * Run this script to initialize the database and check system requirements
 */

echo "=== School Enrollment Management System Setup ===\n\n";

// Check PHP version
echo "Checking PHP version... ";
if (version_compare(PHP_VERSION, '7.4.0', '>=')) {
    echo "✓ PHP " . PHP_VERSION . " (OK)\n";
} else {
    echo "✗ PHP " . PHP_VERSION . " (Requires PHP 7.4+)\n";
    exit(1);
}

// Check required PHP extensions
$required_extensions = ['pdo', 'pdo_mysql', 'json', 'session'];
echo "Checking PHP extensions...\n";
foreach ($required_extensions as $ext) {
    if (extension_loaded($ext)) {
        echo "  ✓ $ext\n";
    } else {
        echo "  ✗ $ext (Required)\n";
        exit(1);
    }
}

// Database configuration
$host = 'localhost';
$dbname = 'school_enrollment_db';
$username = 'root';
$password = '';

echo "\nDatabase Configuration:\n";
echo "Host: $host\n";
echo "Database: $dbname\n";
echo "Username: $username\n";

// Test database connection
echo "\nTesting database connection... ";
try {
    $pdo = new PDO("mysql:host=$host", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "✓ Connected successfully\n";
} catch (PDOException $e) {
    echo "✗ Connection failed: " . $e->getMessage() . "\n";
    exit(1);
}

// Create database if it doesn't exist
echo "Creating database if not exists... ";
try {
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$dbname` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    echo "✓ Database ready\n";
} catch (PDOException $e) {
    echo "✗ Failed to create database: " . $e->getMessage() . "\n";
    exit(1);
}

// Connect to the specific database
try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo "✗ Failed to connect to database: " . $e->getMessage() . "\n";
    exit(1);
}

// Check if tables exist
echo "Checking database tables... ";
$tables = ['admin_users', 'students', 'enrollment_applications', 'queue_items', 'required_documents', 'system_settings', 'activity_logs'];
$existing_tables = [];

try {
    $stmt = $pdo->query("SHOW TABLES");
    while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
        $existing_tables[] = $row[0];
    }
} catch (PDOException $e) {
    echo "✗ Failed to check tables: " . $e->getMessage() . "\n";
    exit(1);
}

$missing_tables = array_diff($tables, $existing_tables);

if (empty($missing_tables)) {
    echo "✓ All tables exist\n";
} else {
    echo "✗ Missing tables: " . implode(', ', $missing_tables) . "\n";
    echo "Please run the database schema from database/schema.sql\n";
    exit(1);
}

// Create uploads directory
echo "Creating uploads directory... ";
$uploads_dir = 'uploads';
if (!file_exists($uploads_dir)) {
    if (mkdir($uploads_dir, 0755, true)) {
        echo "✓ Created successfully\n";
    } else {
        echo "✗ Failed to create directory\n";
        exit(1);
    }
} else {
    echo "✓ Already exists\n";
}

// Check uploads directory permissions
if (is_writable($uploads_dir)) {
    echo "✓ Uploads directory is writable\n";
} else {
    echo "✗ Uploads directory is not writable\n";
    echo "Please set proper permissions: chmod 755 uploads\n";
}

// Check if admin user exists
echo "Checking admin user... ";
try {
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM admin_users WHERE username = 'admin'");
    $stmt->execute();
    $admin_exists = $stmt->fetchColumn() > 0;
    
    if ($admin_exists) {
        echo "✓ Admin user exists\n";
    } else {
        echo "✗ Admin user not found\n";
        echo "Creating default admin user... ";
        
        $password_hash = password_hash('password', PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("INSERT INTO admin_users (username, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute(['admin', 'admin@school.com', $password_hash, 'System Administrator', 'super_admin']);
        
        echo "✓ Created successfully\n";
        echo "Default credentials:\n";
        echo "  Username: admin\n";
        echo "  Password: password\n";
        echo "  IMPORTANT: Change the password after first login!\n";
    }
} catch (PDOException $e) {
    echo "✗ Failed to check/create admin user: " . $e->getMessage() . "\n";
}

// Check system settings
echo "Checking system settings... ";
try {
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM system_settings");
    $stmt->execute();
    $settings_count = $stmt->fetchColumn();
    
    if ($settings_count > 0) {
        echo "✓ System settings exist ($settings_count records)\n";
    } else {
        echo "✗ No system settings found\n";
        echo "Please run the database schema from database/schema.sql\n";
    }
} catch (PDOException $e) {
    echo "✗ Failed to check system settings: " . $e->getMessage() . "\n";
}

echo "\n=== Setup Complete ===\n";
echo "Your School Enrollment Management System is ready!\n\n";
echo "Next steps:\n";
echo "1. Start your web server (Apache/Nginx)\n";
echo "2. Access the system at: http://localhost/school-enrollment-management/src/\n";
echo "3. Login to admin panel with default credentials\n";
echo "4. Change the default admin password\n";
echo "5. Configure system settings as needed\n\n";
echo "For help, see README.md\n";
?>
