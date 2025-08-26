<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once '../config/database.php';

class StudentRegistrationApi {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
        $this->ensureSchema();
    }

    private function ensureSchema(): void {
        $sql = "CREATE TABLE IF NOT EXISTS student_portal_users (
            id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            student_id VARCHAR(50) NULL,
            username VARCHAR(50) NOT NULL UNIQUE,
            email VARCHAR(100) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            first_name VARCHAR(50) NOT NULL,
            middle_name VARCHAR(50) NULL,
            last_name VARCHAR(50) NOT NULL,
            date_of_birth DATE NOT NULL,
            mobile VARCHAR(20) NOT NULL,
            is_verified TINYINT(1) NOT NULL DEFAULT 1,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
        $this->conn->exec($sql);
    }

    private function get(array $data, string $key, $default = null) {
        return isset($data[$key]) ? $data[$key] : $default;
    }

    public function register(array $data): array {
        try {
            // Basic validation
            $required = ['first_name','last_name','date_of_birth','email','mobile','username','password'];
            foreach ($required as $field) {
                if (!isset($data[$field]) || trim((string)$data[$field]) === '') {
                    return ['success' => false, 'message' => "Missing required field: $field"]; 
                }
            }

            // Check uniqueness
            $check = $this->conn->prepare('SELECT 1 FROM student_portal_users WHERE username = ? OR email = ? LIMIT 1');
            $check->execute([$data['username'], $data['email']]);
            if ($check->fetch()) {
                return ['success' => false, 'message' => 'Username or email already registered'];
            }

            // Insert
            $stmt = $this->conn->prepare('INSERT INTO student_portal_users 
                (student_id, username, email, password_hash, first_name, middle_name, last_name, date_of_birth, mobile, is_verified)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)');
            $passwordHash = password_hash($data['password'], PASSWORD_DEFAULT);

            $stmt->execute([
                $this->get($data, 'student_id'),
                $data['username'],
                $data['email'],
                $passwordHash,
                $data['first_name'],
                $this->get($data, 'middle_name', ''),
                $data['last_name'],
                $data['date_of_birth'],
                $data['mobile']
            ]);

            return ['success' => true, 'message' => 'Registration successful'];
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Registration failed: ' . $e->getMessage()];
        }
    }
}

$database = new Database();
$db = $database->getConnection();
$api = new StudentRegistrationApi($db);

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? 'register';

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true) ?? [];
    switch ($action) {
        case 'register':
            echo json_encode($api->register($data));
            break;
        default:
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>
