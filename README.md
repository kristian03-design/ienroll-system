# School Enrollment Management System

A comprehensive school enrollment management system with admin dashboard and queue management built with PHP, MySQL, and modern frontend technologies.

## Features

### Student Enrollment
- Multi-step enrollment form
- Document upload functionality
- Real-time form validation
- Student number generation
- Email notifications

### Admin Dashboard
- Comprehensive dashboard with analytics
- Enrollment management and approval
- Queue management system
- Document verification
- User management
- Activity logging

### Queue Management
- Priority-based queue system
- Real-time queue updates
- Estimated wait times
- Queue analytics
- Staff assignment

### Reports & Analytics
- Enrollment trends
- Grade level statistics
- Queue performance metrics
- Activity logs
- Custom report generation

## Technology Stack

- **Backend**: PHP 7.4+
- **Database**: MySQL 5.7+
- **Frontend**: HTML5, CSS3, JavaScript
- **Styling**: Tailwind CSS
- **Server**: Apache/Nginx (XAMPP/WAMP)

## Installation & Setup

### Prerequisites
- XAMPP, WAMP, or similar local server environment
- PHP 7.4 or higher
- MySQL 5.7 or higher
- Web browser

### Step 1: Database Setup
1. Start your MySQL server
2. Open phpMyAdmin or MySQL command line
3. Import the database schema:
   ```sql
   -- Run the contents of database/schema.sql
   ```

### Step 2: Configuration
1. Copy `env.example` to `.env` (if using environment variables)
2. Update database configuration in `config/database.php`:
   ```php
   private $host = 'localhost';
   private $db_name = 'school_enrollment_db';
   private $username = 'root';
   private $password = '';
   ```

### Step 3: File Permissions
1. Create uploads directory:
   ```bash
   mkdir uploads
   chmod 755 uploads
   ```

### Step 4: Default Admin Account
The system comes with a default admin account:
- **Username**: admin
- **Password**: password
- **Email**: admin@school.com

**Important**: Change the default password after first login!

## API Endpoints

### Authentication
- `POST /api/auth.php?action=login` - Admin login
- `POST /api/auth.php?action=logout` - Admin logout
- `GET /api/auth.php?action=check` - Check authentication status

### Enrollment Management
- `POST /api/enrollment.php?action=submit` - Submit enrollment
- `GET /api/enrollment.php?action=list` - Get enrollments
- `POST /api/enrollment.php?action=update_status` - Update enrollment status
- `GET /api/enrollment.php?action=stats` - Get enrollment statistics

### Queue Management
- `GET /api/queue.php?action=list` - Get queue list
- `POST /api/queue.php?action=start_processing` - Start processing queue item
- `POST /api/queue.php?action=complete_processing` - Complete processing
- `GET /api/queue.php?action=stats` - Get queue statistics
- `GET /api/queue.php?action=my_queue` - Get admin's assigned queue
- `GET /api/queue.php?action=next` - Get next item in queue

### File Upload
- `POST /api/upload.php?action=upload` - Upload document
- `GET /api/upload.php?action=list` - Get documents for enrollment
- `POST /api/upload.php?action=delete` - Delete document
- `POST /api/upload.php?action=verify` - Verify document

### Reports & Analytics
- `GET /api/reports.php?action=dashboard_stats` - Dashboard statistics
- `GET /api/reports.php?action=enrollment_trends` - Enrollment trends
- `GET /api/reports.php?action=grade_level_stats` - Grade level statistics
- `GET /api/reports.php?action=queue_analytics` - Queue analytics
- `GET /api/reports.php?action=activity_logs` - Activity logs
- `GET /api/reports.php?action=enrollment_report` - Generate enrollment report

## Usage

### For Students
1. Access the enrollment system at `src/enrollment-system.html`
2. Complete the multi-step enrollment form
3. Upload required documents
4. Receive queue number and tracking information

### For Administrators
1. Login at `src/admin-login.html`
2. Access dashboard at `src/admin-dashboard.html`
3. Manage enrollments and queue
4. Generate reports and analytics

## Security Features

- Password hashing using bcrypt
- Session-based authentication
- SQL injection prevention with prepared statements
- File upload validation
- Activity logging
- Input sanitization

## File Structure

```
school-enrollment-management/
├── api/                    # PHP API endpoints
│   ├── auth.php           # Authentication
│   ├── enrollment.php     # Enrollment management
│   ├── queue.php          # Queue management
│   ├── upload.php         # File uploads
│   └── reports.php        # Reports & analytics
├── config/
│   └── database.php       # Database configuration
├── database/
│   └── schema.sql         # Database schema
├── uploads/               # Document uploads directory
├── src/                   # Frontend files
│   ├── *.html            # HTML pages
│   ├── *.js              # JavaScript files
│   └── *.css             # Stylesheets
├── env.example           # Environment variables example
└── README.md             # This file
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check MySQL server is running
   - Verify database credentials in `config/database.php`
   - Ensure database `school_enrollment_db` exists

2. **File Upload Issues**
   - Check `uploads/` directory exists and has write permissions
   - Verify PHP file upload settings in `php.ini`
   - Check file size limits

3. **Session Issues**
   - Ensure PHP sessions are enabled
   - Check session storage permissions

4. **CORS Issues**
   - If accessing from different domain, update CORS headers in API files

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.
