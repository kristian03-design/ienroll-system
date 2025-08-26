<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once '../config/database.php';

class EmailVerificationApiSimple {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
        $this->ensureSchema();
    }

    private function ensureSchema(): void {
        $sql = "CREATE TABLE IF NOT EXISTS email_verification_codes (
            id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(100) NOT NULL,
            verification_code VARCHAR(6) NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            is_used TINYINT(1) NOT NULL DEFAULT 0,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_email_code (email, verification_code),
            INDEX idx_expires (expires_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
        $this->conn->exec($sql);
    }

    public function sendVerificationCode(array $data): array {
        try {
            if (!isset($data['email']) || empty($data['email'])) {
                return ['success' => false, 'message' => 'Email is required'];
            }

            $email = filter_var($data['email'], FILTER_VALIDATE_EMAIL);
            if (!$email) {
                return ['success' => false, 'message' => 'Invalid email format'];
            }

            // Generate 6-digit code
            $code = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
            
            // Set expiration (15 minutes from now)
            $expiresAt = date('Y-m-d H:i:s', strtotime('+15 minutes'));

            // Clear old codes for this email
            $stmt = $this->conn->prepare('DELETE FROM email_verification_codes WHERE email = ?');
            $stmt->execute([$email]);

            // Insert new code
            $stmt = $this->conn->prepare('INSERT INTO email_verification_codes (email, verification_code, expires_at) VALUES (?, ?, ?)');
            $stmt->execute([$email, $code, $expiresAt]);

            // Log the code for development
            $this->logCode($email, $code);

            return [
                'success' => true, 
                'message' => 'Verification code sent successfully',
                'data' => [
                    'email' => $email,
                    'expires_in' => 900, // 15 minutes in seconds
                    'code' => $code // For development only - remove in production
                ]
            ];

        } catch (Exception $e) {
            error_log("Email verification error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to send verification code: ' . $e->getMessage()];
        }
    }

    public function verifyCode(array $data): array {
        try {
            if (!isset($data['email']) || !isset($data['code'])) {
                return ['success' => false, 'message' => 'Email and verification code are required'];
            }

            $email = filter_var($data['email'], FILTER_VALIDATE_EMAIL);
            if (!$email) {
                return ['success' => false, 'message' => 'Invalid email format'];
            }

            $code = trim($data['code']);

            // Check if code exists and is valid
            $stmt = $this->conn->prepare('
                SELECT id, expires_at, is_used 
                FROM email_verification_codes 
                WHERE email = ? AND verification_code = ? 
                ORDER BY created_at DESC 
                LIMIT 1
            ');
            $stmt->execute([$email, $code]);
            $result = $stmt->fetch();

            if (!$result) {
                return ['success' => false, 'message' => 'Invalid verification code'];
            }

            if ($result['is_used']) {
                return ['success' => false, 'message' => 'Verification code has already been used'];
            }

            if (strtotime($result['expires_at']) < time()) {
                return ['success' => false, 'message' => 'Verification code has expired'];
            }

            // Mark code as used
            $stmt = $this->conn->prepare('UPDATE email_verification_codes SET is_used = 1 WHERE id = ?');
            $stmt->execute([$result['id']]);

            return ['success' => true, 'message' => 'Email verified successfully'];

        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Verification failed: ' . $e->getMessage()];
        }
    }

    private function logCode($email, $code): void {
        // Log to PHP error log
        error_log("VERIFICATION EMAIL to {$email}: Code = {$code}");
        
        // Log to file
        $logFile = __DIR__ . '/../logs/email_verification.log';
        $logDir = dirname($logFile);
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
        $logEntry = date('Y-m-d H:i:s') . " - Email: {$email}, Code: {$code}\n";
        file_put_contents($logFile, $logEntry, FILE_APPEND | LOCK_EX);
        
        // Also log to browser console (for development)
        echo "<!-- VERIFICATION CODE: {$code} -->\n";
    }
}

$database = new Database();
$db = $database->getConnection();
$api = new EmailVerificationApiSimple($db);

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true) ?? [];
    
    switch ($action) {
        case 'send':
            echo json_encode($api->sendVerificationCode($data));
            break;
        case 'verify':
            echo json_encode($api->verifyCode($data));
            break;
        default:
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>
