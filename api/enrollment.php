<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once '../config/database.php';

class Enrollment {
    private $conn;
    
    public function __construct($db) {
        $this->conn = $db;
    }

    private function getValue(array $data, string $key, $default = '') {
        return isset($data[$key]) && $data[$key] !== '' ? $data[$key] : $default;
    }
    
    public function submitEnrollment($data) {
        try {
            $this->conn->beginTransaction();
            
            // Generate student number
            $studentNumber = $this->generateStudentNumber();
            
            // Normalize/Default fields to avoid undefined indexes
            $firstName = $this->getValue($data, 'first_name');
            $lastName = $this->getValue($data, 'last_name');
            $middleName = $this->getValue($data, 'middle_name');
            $email = $this->getValue($data, 'email');
            $phone = $this->getValue($data, 'phone');
            $dateOfBirth = $this->getValue($data, 'date_of_birth');
            $gender = $this->getValue($data, 'gender', 'other');
            $address = $this->getValue($data, 'address');
            $city = $this->getValue($data, 'city');
            $state = $this->getValue($data, 'state');
            $zipCode = $this->getValue($data, 'zip_code');
            $emergencyName = $this->getValue($data, 'emergency_contact_name');
            $emergencyPhone = $this->getValue($data, 'emergency_contact_phone');
            $emergencyRel = $this->getValue($data, 'emergency_contact_relationship');

            // Insert student data
            $studentQuery = "INSERT INTO students (student_number, first_name, last_name, middle_name, email, phone, date_of_birth, gender, address, city, state, zip_code, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $studentStmt = $this->conn->prepare($studentQuery);
            $studentStmt->execute([
                $studentNumber,
                $firstName,
                $lastName,
                $middleName,
                $email,
                $phone,
                $dateOfBirth,
                $gender,
                $address,
                $city,
                $state,
                $zipCode,
                $emergencyName,
                $emergencyPhone,
                $emergencyRel
            ]);
            
            $studentId = $this->conn->lastInsertId();
            
            // Normalize enrollment fields
            $academicYear = $this->getValue($data, 'academic_year');
            $gradeLevel = $this->getValue($data, 'grade_level', 'college');
            $previousSchool = $this->getValue($data, 'previous_school');
            $previousGrade = $this->getValue($data, 'previous_grade');
            $priorityLevel = $this->getValue($data, 'priority_level', 'medium');
            
            // Insert enrollment application
            $enrollmentQuery = "INSERT INTO enrollment_applications (student_id, academic_year, grade_level, previous_school, previous_grade, priority_level) VALUES (?, ?, ?, ?, ?, ?)";
            $enrollmentStmt = $this->conn->prepare($enrollmentQuery);
            $enrollmentStmt->execute([
                $studentId,
                $academicYear,
                $gradeLevel,
                $previousSchool,
                $previousGrade,
                $priorityLevel
            ]);
            
            $enrollmentId = $this->conn->lastInsertId();
            
            // Add to queue
            $queueNumber = $this->getNextQueueNumber();
            $queueQuery = "INSERT INTO queue_items (enrollment_id, queue_number, priority_level) VALUES (?, ?, ?)";
            $queueStmt = $this->conn->prepare($queueQuery);
            $queueStmt->execute([
                $enrollmentId,
                $queueNumber,
                $priorityLevel
            ]);
            
            $this->conn->commit();
            
            return [
                'success' => true,
                'message' => 'Enrollment submitted successfully',
                'data' => [
                    'student_number' => $studentNumber,
                    'enrollment_id' => $enrollmentId,
                    'queue_number' => $queueNumber
                ]
            ];
            
        } catch (Exception $e) {
            $this->conn->rollback();
            return ['success' => false, 'message' => 'Enrollment submission failed: ' . $e->getMessage()];
        }
    }
    
    public function getEnrollments($filters = []) {
        try {
            $whereClause = "WHERE 1=1";
            $params = [];
            
            if (isset($filters['status'])) {
                $whereClause .= " AND ea.enrollment_status = ?";
                $params[] = $filters['status'];
            }
            
            if (isset($filters['grade_level'])) {
                $whereClause .= " AND ea.grade_level = ?";
                $params[] = $filters['grade_level'];
            }
            
            if (isset($filters['search'])) {
                $whereClause .= " AND (s.first_name LIKE ? OR s.last_name LIKE ? OR s.student_number LIKE ?)";
                $searchTerm = "%{$filters['search']}%";
                $params[] = $searchTerm;
                $params[] = $searchTerm;
                $params[] = $searchTerm;
            }
            
            $query = "SELECT ea.*, s.*, qi.queue_number, qi.queue_status 
                     FROM enrollment_applications ea 
                     JOIN students s ON ea.student_id = s.id 
                     LEFT JOIN queue_items qi ON ea.id = qi.enrollment_id 
                     $whereClause 
                     ORDER BY ea.application_date DESC";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute($params);
            
            return [
                'success' => true,
                'data' => $stmt->fetchAll()
            ];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Failed to fetch enrollments: ' . $e->getMessage()];
        }
    }
    
    public function updateEnrollmentStatus($enrollmentId, $status, $adminId, $notes = '') {
        try {
            $query = "UPDATE enrollment_applications SET enrollment_status = ?, processed_date = NOW(), processed_by = ?, notes = ? WHERE id = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$status, $adminId, $notes, $enrollmentId]);
            
            if ($stmt->rowCount() > 0) {
                // Update queue status if enrollment is processed
                if ($status === 'approved' || $status === 'rejected') {
                    $queueQuery = "UPDATE queue_items SET queue_status = 'completed', completed_at = NOW() WHERE enrollment_id = ?";
                    $queueStmt = $this->conn->prepare($queueQuery);
                    $queueStmt->execute([$enrollmentId]);
                }
                
                return ['success' => true, 'message' => 'Enrollment status updated successfully'];
            } else {
                return ['success' => false, 'message' => 'Enrollment not found'];
            }
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Failed to update enrollment status: ' . $e->getMessage()];
        }
    }
    
    public function getEnrollmentStats() {
        try {
            $query = "SELECT 
                        enrollment_status,
                        COUNT(*) as count
                     FROM enrollment_applications 
                     GROUP BY enrollment_status";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            
            $stats = [];
            while ($row = $stmt->fetch()) {
                $stats[$row['enrollment_status']] = $row['count'];
            }
            
            return [
                'success' => true,
                'data' => $stats
            ];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Failed to fetch enrollment stats: ' . $e->getMessage()];
        }
    }
    
    private function generateStudentNumber() {
        $year = date('Y');
        $query = "SELECT COUNT(*) as count FROM students WHERE student_number LIKE ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$year . '%']);
        $result = $stmt->fetch();
        
        $count = $result['count'] + 1;
        return $year . str_pad($count, 4, '0', STR_PAD_LEFT);
    }
    
    private function getNextQueueNumber() {
        $query = "SELECT MAX(queue_number) as max_number FROM queue_items";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $result = $stmt->fetch();
        
        return ($result['max_number'] ?? 0) + 1;
    }
}

// Handle requests
$database = new Database();
$db = $database->getConnection();
$enrollment = new Enrollment($db);

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $action = $_GET['action'] ?? '';
    
    switch ($action) {
        case 'submit':
            $result = $enrollment->submitEnrollment($data ?? []);
            echo json_encode($result);
            break;
            
        case 'update_status':
            if (isset($data['enrollment_id']) && isset($data['status'])) {
                session_start();
                $adminId = $_SESSION['admin_id'] ?? null;
                $result = $enrollment->updateEnrollmentStatus(
                    $data['enrollment_id'],
                    $data['status'],
                    $adminId,
                    $data['notes'] ?? ''
                );
                echo json_encode($result);
            } else {
                echo json_encode(['success' => false, 'message' => 'Enrollment ID and status required']);
            }
            break;
            
        default:
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
} elseif ($method === 'GET') {
    $action = $_GET['action'] ?? '';
    
    switch ($action) {
        case 'list':
            $filters = $_GET;
            unset($filters['action']);
            $result = $enrollment->getEnrollments($filters);
            echo json_encode($result);
            break;
            
        case 'stats':
            $result = $enrollment->getEnrollmentStats();
            echo json_encode($result);
            break;
            
        default:
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>
