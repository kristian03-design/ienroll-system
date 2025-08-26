# iEnroll Email Verification Setup Guide

## 🚀 Quick Start (No Composer Required)

For immediate testing without installing Composer:

### Step 1: Test the Simple Version
1. **Run the diagnostic tool**: `http://localhost/school-enrollment-management/install_dependencies.php`
2. **Test the simple API**: The system now uses `email_verification_simple.php` which doesn't require Composer
3. **Check verification codes**: Look in `logs/email_verification.log` or browser Network tab

### Step 2: Test Registration
1. Open: `http://localhost/school-enrollment-management/src/student-registration.html`
2. Complete Steps 1 & 2
3. Check browser Network tab for verification code
4. Use the code to complete registration

## 📦 Advanced Setup (With Composer)

For production-ready email sending with PHPMailer:

### Step 1: Install Composer

#### Windows:
1. Download Composer-Setup.exe from: https://getcomposer.org/download/
2. Run the installer
3. Restart command prompt

#### Manual Installation:
1. Download composer.phar from: https://getcomposer.org/composer.phar
2. Place it in your project directory

### Step 2: Install Dependencies
```bash
# If Composer is installed globally:
composer install

# If using composer.phar:
php composer.phar install
```

### Step 3: Configure Environment
1. Copy environment file:
   ```bash
   copy env.example .env
   ```
2. Edit `.env` file with your settings:
   ```env
   # Database
   DB_HOST=localhost
   DB_NAME=school_enrollment_db
   DB_USER=root
   DB_PASSWORD=

   # Email (for production)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USERNAME=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   EMAIL_FROM=noreply@ienroll.com
   EMAIL_FROM_NAME=iEnroll System

   # Application
   APP_ENV=development
   APP_DEBUG=true
   ```

### Step 4: Switch to Advanced Version
Update the frontend to use the advanced API:
```javascript
// In src/student-registration.html, change:
fetch('../api/email_verification.php?action=send', {
// Instead of:
fetch('../api/email_verification_simple.php?action=send', {
```

## 🔧 Troubleshooting

### Common Issues:

#### 1. "Failed to send verification code"
**Solutions**:
- Check if MySQL is running in XAMPP
- Run: `http://localhost/school-enrollment-management/install_dependencies.php`
- Check database connection in `config/database.php`

#### 2. "Composer not found"
**Solutions**:
- Install Composer (see Step 1 above)
- Or use the simple version (no Composer required)

#### 3. "Database connection failed"
**Solutions**:
- Start MySQL in XAMPP Control Panel
- Check database credentials
- Create database: `school_enrollment_db`

#### 4. "Table does not exist"
**Solutions**:
- Run: `http://localhost/school-enrollment-management/setup.php`
- Or manually create tables in phpMyAdmin

### How to Get Verification Codes:

#### Method 1: Browser Developer Tools
1. Open registration form
2. Press F12 → Network tab
3. Complete Steps 1 & 2, click "Continue"
4. Look for API call to `email_verification_simple.php`
5. Check Response tab for verification code

#### Method 2: Log Files
- Check: `logs/email_verification.log`
- Each line: `Email: user@example.com, Code: 123456`

#### Method 3: PHP Error Log
- Check: `C:\xampp\php\logs\php_error_log`
- Look for: `VERIFICATION EMAIL to user@example.com: Code = 123456`

## 📁 File Structure

```
school-enrollment-management/
├── api/
│   ├── email_verification.php          # Advanced version (with Composer)
│   ├── email_verification_simple.php   # Simple version (no Composer)
│   └── student_registration.php
├── config/
│   └── database.php
├── logs/
│   └── email_verification.log          # Verification codes log
├── src/
│   └── student-registration.html
├── vendor/                             # Composer dependencies
├── composer.json                       # Dependencies configuration
├── env.example                         # Environment template
├── install_dependencies.php            # Setup guide
├── test_email_api.php                  # API test
└── SETUP_GUIDE.md                      # This file
```

## 🎯 Testing Checklist

- [ ] XAMPP running (Apache + MySQL)
- [ ] Database `school_enrollment_db` exists
- [ ] Tables created (run setup.php)
- [ ] API files accessible
- [ ] Logs directory writable
- [ ] Registration form loads
- [ ] Verification codes generated
- [ ] Codes can be retrieved from logs/Network tab
- [ ] Registration completes successfully

## 🔄 Development vs Production

### Development Mode:
- Verification codes logged to files
- No actual emails sent
- Codes included in API response
- Easy testing and debugging

### Production Mode:
- Real emails sent via SMTP
- PHPMailer for reliable delivery
- Environment variables for configuration
- Secure code handling

## 📞 Support

If you encounter issues:

1. **Run the diagnostic tool**: `install_dependencies.php`
2. **Check the logs**: `logs/email_verification.log`
3. **Test the API**: `test_email_api.php`
4. **Verify database**: Check phpMyAdmin
5. **Check XAMPP**: Ensure services are running

## 🎉 Success Indicators

When everything is working:
- ✅ Registration form loads without errors
- ✅ Steps 1 & 2 complete successfully
- ✅ Verification code is generated and logged
- ✅ Code can be retrieved from logs or Network tab
- ✅ Registration completes and redirects to dashboard
- ✅ User account is created in database

The system is designed to work out of the box for development with the simple version, and can be upgraded to production-ready email sending with Composer dependencies.
