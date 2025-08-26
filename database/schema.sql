-- School Enrollment Management System Database Schema
-- Safe to run multiple times (drops and recreates)

-- Database
CREATE DATABASE IF NOT EXISTS school_enrollment_db
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;
USE school_enrollment_db;

-- Drop in dependency order
DROP TABLE IF EXISTS required_documents;
DROP TABLE IF EXISTS queue_items;
DROP TABLE IF EXISTS enrollment_applications;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS activity_logs;
DROP TABLE IF EXISTS system_settings;
DROP TABLE IF EXISTS admin_users;

-- Admin users
CREATE TABLE IF NOT EXISTS admin_users (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role ENUM('super_admin','admin','staff') NOT NULL DEFAULT 'staff',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Students
CREATE TABLE IF NOT EXISTS students (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  student_number VARCHAR(20) NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  middle_name VARCHAR(50),
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  date_of_birth DATE NOT NULL,
  gender ENUM('male','female','other') NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(50) NOT NULL,
  state VARCHAR(50) NOT NULL,
  zip_code VARCHAR(10) NOT NULL,
  emergency_contact_name VARCHAR(100) NOT NULL,
  emergency_contact_phone VARCHAR(20) NOT NULL,
  emergency_contact_relationship VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_students_student_number (student_number),
  UNIQUE KEY uq_students_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Enrollment applications (updated to use grade11, grade12, college)
CREATE TABLE IF NOT EXISTS enrollment_applications (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  academic_year VARCHAR(10) NOT NULL,
  grade_level ENUM('grade11','grade12','college') NOT NULL,
  previous_school VARCHAR(100),
  previous_grade VARCHAR(10),
  enrollment_status ENUM('pending','approved','rejected','waitlisted') NOT NULL DEFAULT 'pending',
  priority_level ENUM('low','medium','high') NOT NULL DEFAULT 'medium',
  application_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  processed_date TIMESTAMP NULL,
  processed_by INT NULL,
  notes TEXT,
  CONSTRAINT fk_enroll_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_enroll_processed_by FOREIGN KEY (processed_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  KEY idx_enrollment_status (enrollment_status),
  KEY idx_enrollment_student (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Queue management
CREATE TABLE IF NOT EXISTS queue_items (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  enrollment_id INT NOT NULL,
  queue_number INT NOT NULL,
  queue_status ENUM('waiting','processing','completed','cancelled') NOT NULL DEFAULT 'waiting',
  priority_level ENUM('low','medium','high') NOT NULL DEFAULT 'medium',
  estimated_wait_time INT NOT NULL DEFAULT 0, -- minutes
  actual_wait_time INT NOT NULL DEFAULT 0, -- minutes
  assigned_to INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  started_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  CONSTRAINT fk_queue_enrollment FOREIGN KEY (enrollment_id) REFERENCES enrollment_applications(id) ON DELETE CASCADE,
  CONSTRAINT fk_queue_assigned_to FOREIGN KEY (assigned_to) REFERENCES admin_users(id) ON DELETE SET NULL,
  KEY idx_queue_status (queue_status),
  KEY idx_queue_priority (priority_level),
  KEY idx_queue_enrollment (enrollment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Required documents (use VARCHAR instead of huge ENUM to avoid errors)
CREATE TABLE IF NOT EXISTS required_documents (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  enrollment_id INT NOT NULL,
  document_type VARCHAR(100) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INT NOT NULL,
  is_verified TINYINT(1) NOT NULL DEFAULT 0,
  verified_by INT NULL,
  verified_at TIMESTAMP NULL,
  uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_docs_enrollment FOREIGN KEY (enrollment_id) REFERENCES enrollment_applications(id) ON DELETE CASCADE,
  CONSTRAINT fk_docs_verified_by FOREIGN KEY (verified_by) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- System settings
CREATE TABLE IF NOT EXISTS system_settings (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Activity logs
CREATE TABLE IF NOT EXISTS activity_logs (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  user_type ENUM('admin','student') NOT NULL,
  action VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_logs_user FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed default admin (password = 'password')
INSERT INTO admin_users (username, email, password_hash, full_name, role)
VALUES ('admin','admin@school.com','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','System Administrator','super_admin')
ON DUPLICATE KEY UPDATE email = VALUES(email);

-- Seed default system settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('enrollment_open','true','Whether enrollment is currently open'),
('max_queue_size','100','Maximum number of students in queue'),
('processing_time_per_student','15','Average processing time per student in minutes'),
('notification_email','admin@school.com','Email for system notifications'),
('school_name','iEnroll School','Name of the school'),
('academic_year','2024-2025','Current academic year')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), description = VALUES(description);
