<?php
echo "<h1>iEnroll - Dependency Installation Guide</h1>";
echo "<style>body{font-family:Arial,sans-serif;margin:20px;} .success{color:green;} .error{color:red;} .info{color:blue;} .warning{color:orange;}</style>";

// Check if Composer is installed
echo "<h2>1. Composer Installation Check</h2>";
$composerInstalled = false;

// Check if composer.phar exists
if (file_exists('composer.phar')) {
    echo "<p class='success'>✅ composer.phar found in project directory</p>";
    $composerInstalled = true;
} else {
    // Check if composer is available globally
    $output = shell_exec('composer --version 2>&1');
    if (strpos($output, 'Composer version') !== false) {
        echo "<p class='success'>✅ Composer is installed globally</p>";
        $composerInstalled = true;
    } else {
        echo "<p class='error'>❌ Composer is not installed</p>";
        echo "<p class='info'>💡 You need to install Composer first</p>";
    }
}

if (!$composerInstalled) {
    echo "<h3>How to Install Composer:</h3>";
    echo "<ol>";
    echo "<li><strong>Windows:</strong>";
    echo "<ul>";
    echo "<li>Download Composer-Setup.exe from <a href='https://getcomposer.org/download/' target='_blank'>https://getcomposer.org/download/</a></li>";
    echo "<li>Run the installer and follow the instructions</li>";
    echo "<li>Restart your command prompt after installation</li>";
    echo "</ul></li>";
    echo "<li><strong>Alternative (Manual):</strong>";
    echo "<ul>";
    echo "<li>Download composer.phar from <a href='https://getcomposer.org/composer.phar' target='_blank'>https://getcomposer.org/composer.phar</a></li>";
    echo "<li>Place it in your project directory</li>";
    echo "</ul></li>";
    echo "</ol>";
    echo "<p class='warning'>⚠️ After installing Composer, refresh this page</p>";
    exit;
}

// Check if vendor directory exists
echo "<h2>2. Dependencies Check</h2>";
if (is_dir('vendor')) {
    echo "<p class='success'>✅ vendor directory exists</p>";
    
    // Check if required packages are installed
    $requiredPackages = ['phpmailer/phpmailer', 'vlucas/phpdotenv'];
    foreach ($requiredPackages as $package) {
        $packagePath = 'vendor/' . $package;
        if (is_dir($packagePath)) {
            echo "<p class='success'>✅ {$package} is installed</p>";
        } else {
            echo "<p class='error'>❌ {$package} is missing</p>";
        }
    }
} else {
    echo "<p class='error'>❌ vendor directory does not exist</p>";
    echo "<p class='info'>💡 You need to install dependencies</p>";
}

// Installation instructions
echo "<h2>3. Installation Instructions</h2>";

if (!is_dir('vendor')) {
    echo "<h3>Install Dependencies:</h3>";
    echo "<p class='info'>Run one of these commands in your project directory:</p>";
    echo "<div style='background:#f5f5f5;padding:10px;border-radius:5px;margin:10px 0;'>";
    echo "<p><strong>If Composer is installed globally:</strong></p>";
    echo "<code>composer install</code><br><br>";
    echo "<p><strong>If using composer.phar:</strong></p>";
    echo "<code>php composer.phar install</code>";
    echo "</div>";
}

// Check if .env file exists
echo "<h2>4. Environment Configuration</h2>";
if (file_exists('.env')) {
    echo "<p class='success'>✅ .env file exists</p>";
} else {
    echo "<p class='warning'>⚠️ .env file does not exist</p>";
    echo "<p class='info'>💡 Copy env.example to .env and configure your settings:</p>";
    echo "<div style='background:#f5f5f5;padding:10px;border-radius:5px;margin:10px 0;'>";
    echo "<code>copy env.example .env</code>";
    echo "</div>";
}

// Test setup
echo "<h2>5. Test Setup</h2>";
echo "<p class='info'>After installing dependencies, test the setup:</p>";
echo "<ul>";
echo "<li><a href='test_email_api.php'>Test Email API</a></li>";
echo "<li><a href='diagnose_email_verification.php'>Run Diagnostic Tool</a></li>";
echo "</ul>";

// Quick commands
echo "<h2>6. Quick Commands</h2>";
echo "<div style='background:#f5f5f5;padding:10px;border-radius:5px;margin:10px 0;'>";
echo "<p><strong>Install dependencies:</strong></p>";
echo "<code>composer install</code><br><br>";
echo "<p><strong>Update dependencies:</strong></p>";
echo "<code>composer update</code><br><br>";
echo "<p><strong>Add new package:</strong></p>";
echo "<code>composer require package-name</code><br><br>";
echo "<p><strong>Check for security issues:</strong></p>";
echo "<code>composer audit</code>";
echo "</div>";

echo "<h2>7. Next Steps</h2>";
echo "<ol>";
echo "<li>Install Composer (if not already installed)</li>";
echo "<li>Run <code>composer install</code> to install dependencies</li>";
echo "<li>Copy <code>env.example</code> to <code>.env</code> and configure settings</li>";
echo "<li>Test the email verification system</li>";
echo "<li>Configure email settings for production</li>";
echo "</ol>";

echo "<p class='info'>💡 <strong>Note:</strong> In development mode, verification codes will be logged to files instead of being sent via email.</p>";
?>
