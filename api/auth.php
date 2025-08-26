<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once '../config/database.php';

class Auth {
    private $conn;
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    public function login($username, $password) {
        try {
            $query = "SELECT id, username, email, password_hash, full_name, role FROM admin_users WHERE username = ? AND is_active = 1";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$username]);
            
            if ($stmt->rowCount() > 0) {
                $user = $stmt->fetch();
                
                if (password_verify($password, $user['password_hash'])) {
                    // Start session and store user data
                    session_start();
                    $_SESSION['admin_id'] = $user['id'];
                    $_SESSION['admin_username'] = $user['username'];
                    $_SESSION['admin_role'] = $user['role'];
                    $_SESSION['admin_name'] = $user['full_name'];
                    
                    // Log activity
                    $this->logActivity($user['id'], 'admin', 'login', 'Admin logged in successfully');
                    
                    return [
                        'success' => true,
                        'message' => 'Login successful',
                        'user' => [
                            'id' => $user['id'],
                            'username' => $user['username'],
                            'email' => $user['email'],
                            'full_name' => $user['full_name'],
                            'role' => $user['role']
                        ]
                    ];
                } else {
                    return ['success' => false, 'message' => 'Invalid password'];
                }
            } else {
                return ['success' => false, 'message' => 'User not found or inactive'];
            }
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Login failed: ' . $e->getMessage()];
        }
    }
    
    public function logout() {
        session_start();
        if (isset($_SESSION['admin_id'])) {
            $this->logActivity($_SESSION['admin_id'], 'admin', 'logout', 'Admin logged out');
        }
        session_destroy();
        return ['success' => true, 'message' => 'Logged out successfully'];
    }
    
    public function checkAuth() {
        session_start();
        if (isset($_SESSION['admin_id'])) {
            return [
                'success' => true,
                'authenticated' => true,
                'user' => [
                    'id' => $_SESSION['admin_id'],
                    'username' => $_SESSION['admin_username'],
                    'role' => $_SESSION['admin_role'],
                    'name' => $_SESSION['admin_name']
                ]
            ];
        } else {
            return ['success' => true, 'authenticated' => false];
        }
    }
    
    private function logActivity($user_id, $user_type, $action, $description) {
        try {
            $query = "INSERT INTO activity_logs (user_id, user_type, action, description, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([
                $user_id,
                $user_type,
                $action,
                $description,
                $_SERVER['REMOTE_ADDR'] ?? 'unknown',
                $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
            ]);
        } catch (Exception $e) {
            // Log error silently
        }
    }
}

// Handle requests
$database = new Database();
$db = $database->getConnection();
$auth = new Auth($db);

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $action = $_GET['action'] ?? '';
    
    switch ($action) {
        case 'login':
            if (isset($data['username']) && isset($data['password'])) {
                $result = $auth->login($data['username'], $data['password']);
                echo json_encode($result);
            } else {
                echo json_encode(['success' => false, 'message' => 'Username and password required']);
            }
            break;
            
        case 'logout':
            $result = $auth->logout();
            echo json_encode($result);
            break;
            
        default:
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
} elseif ($method === 'GET') {
    $action = $_GET['action'] ?? '';
    
    switch ($action) {
        case 'check':
            $result = $auth->checkAuth();
            echo json_encode($result);
            break;
            
        default:
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>
