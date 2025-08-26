<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Load Composer autoloader
require_once '../vendor/autoload.php';

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

require_once '../config/database.php';

class EmailVerificationApi {
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

            // Send email (simulated for now)
            $this->sendEmail($email, $code);

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

    private function sendEmail($email, $code): void {
        // Log to file for debugging
        $logFile = __DIR__ . '/../logs/email_verification.log';
        $logDir = dirname($logFile);
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
        $logEntry = date('Y-m-d H:i:s') . " - Email: {$email}, Code: {$code}\n";
        file_put_contents($logFile, $logEntry, FILE_APPEND | LOCK_EX);
        
        // Check if we're in development mode
        $isDevelopment = $_ENV['APP_ENV'] ?? 'development';
        
        if ($isDevelopment === 'development') {
            // In development, just log the code
            error_log("VERIFICATION EMAIL to {$email}: Code = {$code}");
            return;
        }
        
        // In production, send actual email using PHPMailer
        try {
            $mail = new PHPMailer\PHPMailer\PHPMailer(true);
            
            // Server settings
            $mail->isSMTP();
            $mail->Host = $_ENV['EMAIL_HOST'] ?? 'smtp.gmail.com';
            $mail->SMTPAuth = true;
            $mail->Username = $_ENV['EMAIL_USERNAME'] ?? '';
            $mail->Password = $_ENV['EMAIL_PASSWORD'] ?? '';
            $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = $_ENV['EMAIL_PORT'] ?? 587;
            
            // Recipients
            $mail->setFrom($_ENV['EMAIL_FROM'] ?? 'noreply@ienroll.com', $_ENV['EMAIL_FROM_NAME'] ?? 'iEnroll System');
            $mail->addAddress($email);
            
            // Content
            $mail->isHTML(true);
            $mail->Subject = 'iEnroll - Email Verification Code';
            $mail->Body = "
            <html>
            <body>
                <h2>iEnroll Student Portal Registration</h2>
                <p>Your email verification code is: <strong>{$code}</strong></p>
                <p>This code will expire in 15 minutes.</p>
                <p>If you didn't request this code, please ignore this email.</p>
                <br>
                <p>Best regards,<br>iEnroll Team</p>
            </body>
            </html>
            ";
            
            $mail->send();
            error_log("Verification email sent successfully to {$email}");
            
        } catch (Exception $e) {
            error_log("Email sending failed: " . $e->getMessage());
            // Fallback to logging only
        }
    }
}

$database = new Database();
$db = $database->getConnection();
$api = new EmailVerificationApi($db);

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
