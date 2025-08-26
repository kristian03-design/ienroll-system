# Email Verification Setup Guide

## Quick Fix - Development Mode

For immediate testing, the system now includes the verification code in the API response during development.

### Step 1: Test the Current Setup
1. Open your browser and go to: `http://localhost/school-enrollment-management/test_email_api.php`
2. This will test the database connection and API functionality
3. Check what results you get

### Step 2: Check Verification Codes
1. Open browser Developer Tools (F12)
2. Go to Network tab
3. Try to send verification code from the registration form
4. Look for the API call to `email_verification.php`
5. Check the response - it should include the actual code

### Step 3: Check Logs
1. Look for a `logs/email_verification.log` file in your project folder
2. Check your PHP error log (usually in `C:\xampp\php\logs\php_error_log`)

## Complete Setup Guide

### Prerequisites
- XAMPP running (Apache + MySQL)
- PHP 7.4 or higher
- MySQL 5.7 or higher

### Step 1: Database Setup
1. **Start XAMPP Control Panel**
2. **Start Apache and MySQL services**
3. **Open phpMyAdmin**: `http://localhost/phpmyadmin`
4. **Create database** (if not exists):
   ```sql
   CREATE DATABASE IF NOT EXISTS school_enrollment_db;
   ```
5. **Run the setup script**: `http://localhost/school-enrollment-management/setup.php`

### Step 2: File Permissions
1. **Create logs directory**:
   ```bash
   mkdir logs
   ```
2. **Set permissions** (if on Linux/Mac):
   ```bash
   chmod 755 logs
   chmod 644 logs/email_verification.log
   ```

### Step 3: Test Database Connection
1. **Check config/database.php**:
   ```php
   private $host = 'localhost';
   private $db_name = 'school_enrollment_db';
   private $username = 'root';
   private $password = ''; // Your MySQL password if set
   ```

### Step 4: Test the API
1. **Run the test file**: `http://localhost/school-enrollment-management/test_email_api.php`
2. **Expected results**:
   - ✅ Database connection successful
   - ✅ Email verification table exists
   - ✅ API test successful

### Step 5: Troubleshooting Common Issues

#### Issue 1: "Database connection failed"
**Solution**:
- Check if MySQL is running in XAMPP
- Verify database credentials in `config/database.php`
- Create database manually in phpMyAdmin

#### Issue 2: "Table does not exist"
**Solution**:
- Run the setup script: `http://localhost/school-enrollment-management/setup.php`
- Or manually create the table in phpMyAdmin

#### Issue 3: "Permission denied" for logs
**Solution**:
- Create logs directory manually
- Check file permissions
- On Windows, ensure the web server has write access

#### Issue 4: API returns 404
**Solution**:
- Check if the API file exists: `api/email_verification.php`
- Verify the URL path in the frontend JavaScript
- Check Apache configuration

### Step 6: Development Testing

#### Method 1: Browser Developer Tools
1. Open registration form
2. Press F12 to open Developer Tools
3. Go to Network tab
4. Complete steps 1 and 2, then click "Continue"
5. Look for the API call to `email_verification.php`
6. Check the response - it will include the verification code

#### Method 2: Log Files
1. Check `logs/email_verification.log` file
2. Check PHP error log: `C:\xampp\php\logs\php_error_log`

#### Method 3: Direct API Test
1. Use Postman or similar tool
2. POST to: `http://localhost/school-enrollment-management/api/email_verification.php?action=send`
3. Body: `{"email": "test@example.com"}`

### Step 7: Production Email Setup

For actual email sending, uncomment and configure the mail function:

```php
// In api/email_verification.php, uncomment these lines:
$headers = "MIME-Version: 1.0" . "\r\n";
$headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
$headers .= "From: noreply@ienroll.com" . "\r\n";

mail($email, $subject, $message, $headers);
```

### Step 8: Verification Process

1. **User fills registration form** (Steps 1 & 2)
2. **System sends verification code** (Step 3)
3. **User enters the code**
4. **System verifies the code**
5. **Registration completes**

## Quick Commands

### Check if services are running:
```bash
# Check Apache
netstat -an | findstr :80

# Check MySQL
netstat -an | findstr :3306
```

### Check PHP error log:
```bash
# Windows
type C:\xampp\php\logs\php_error_log

# Linux/Mac
tail -f /var/log/apache2/error.log
```

### Test database connection:
```bash
# Using PHP CLI
php -r "require 'config/database.php'; \$db = new Database(); echo 'Connected: ' . (\$db->getConnection() ? 'Yes' : 'No');"
```

## Expected Behavior

### Success Flow:
1. User completes Steps 1 & 2
2. System automatically sends verification code
3. User sees "Sending..." then countdown
4. User enters the 6-digit code
5. System verifies and creates account
6. User is redirected to dashboard

### Error Handling:
- Invalid email format
- Database connection issues
- Code expiration (15 minutes)
- Already used codes
- Network errors

## Support

If you're still having issues:
1. Check the test file results
2. Review PHP error logs
3. Verify database connection
4. Check file permissions
5. Ensure all services are running

The system is designed to work out of the box for development with simulated email sending and code logging.
