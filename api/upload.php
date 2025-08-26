<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once '../config/database.php';

class FileUpload {
    private $conn;
    private $uploadDir = '../uploads/';
    private $allowedTypes = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'];
    private $maxFileSize = 5242880; // 5MB
    
    public function __construct($db) {
        $this->conn = $db;
        // Create upload directory if it doesn't exist
        if (!file_exists($this->uploadDir)) {
            mkdir($this->uploadDir, 0755, true);
        }
    }
    
    public function uploadDocument($file, $enrollmentId, $documentType) {
        try {
            // Validate file
            $validation = $this->validateFile($file);
            if (!$validation['success']) {
                return $validation;
            }
            
            // Generate unique filename
            $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
            $filename = uniqid() . '_' . time() . '.' . $extension;
            $filepath = $this->uploadDir . $filename;
            
            // Move uploaded file
            if (move_uploaded_file($file['tmp_name'], $filepath)) {
                // Save to database
                $query = "INSERT INTO required_documents (enrollment_id, document_type, file_name, file_path, file_size) VALUES (?, ?, ?, ?, ?)";
                $stmt = $this->conn->prepare($query);
                $stmt->execute([
                    $enrollmentId,
                    $documentType,
                    $file['name'],
                    $filepath,
                    $file['size']
                ]);
                
                $documentId = $this->conn->lastInsertId();
                
                return [
                    'success' => true,
                    'message' => 'Document uploaded successfully',
                    'data' => [
                        'document_id' => $documentId,
                        'filename' => $file['name'],
                        'filepath' => $filepath
                    ]
                ];
            } else {
                return ['success' => false, 'message' => 'Failed to move uploaded file'];
            }
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Upload failed: ' . $e->getMessage()];
        }
    }
    
    public function getDocuments($enrollmentId) {
        try {
            $query = "SELECT * FROM required_documents WHERE enrollment_id = ? ORDER BY uploaded_at DESC";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$enrollmentId]);
            
            return [
                'success' => true,
                'data' => $stmt->fetchAll()
            ];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Failed to fetch documents: ' . $e->getMessage()];
        }
    }
    
    public function deleteDocument($documentId) {
        try {
            // Get file path before deletion
            $query = "SELECT file_path FROM required_documents WHERE id = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$documentId]);
            $document = $stmt->fetch();
            
            if ($document) {
                // Delete from database
                $deleteQuery = "DELETE FROM required_documents WHERE id = ?";
                $deleteStmt = $this->conn->prepare($deleteQuery);
                $deleteStmt->execute([$documentId]);
                
                // Delete physical file
                if (file_exists($document['file_path'])) {
                    unlink($document['file_path']);
                }
                
                return ['success' => true, 'message' => 'Document deleted successfully'];
            } else {
                return ['success' => false, 'message' => 'Document not found'];
            }
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Failed to delete document: ' . $e->getMessage()];
        }
    }
    
    public function verifyDocument($documentId, $adminId) {
        try {
            $query = "UPDATE required_documents SET is_verified = 1, verified_by = ?, verified_at = NOW() WHERE id = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$adminId, $documentId]);
            
            if ($stmt->rowCount() > 0) {
                return ['success' => true, 'message' => 'Document verified successfully'];
            } else {
                return ['success' => false, 'message' => 'Document not found'];
            }
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Failed to verify document: ' . $e->getMessage()];
        }
    }
    
    private function validateFile($file) {
        // Check if file was uploaded
        if (!isset($file['tmp_name']) || !is_uploaded_file($file['tmp_name'])) {
            return ['success' => false, 'message' => 'No file uploaded'];
        }
        
        // Check file size
        if ($file['size'] > $this->maxFileSize) {
            return ['success' => false, 'message' => 'File size exceeds limit (5MB)'];
        }
        
        // Check file type
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($extension, $this->allowedTypes)) {
            return ['success' => false, 'message' => 'File type not allowed'];
        }
        
        // Check for upload errors
        if ($file['error'] !== UPLOAD_ERR_OK) {
            return ['success' => false, 'message' => 'Upload error: ' . $file['error']];
        }
        
        return ['success' => true];
    }
}

// Handle requests
$database = new Database();
$db = $database->getConnection();
$upload = new FileUpload($db);

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $action = $_GET['action'] ?? '';
    
    switch ($action) {
        case 'upload':
            if (isset($_FILES['document']) && isset($_POST['enrollment_id']) && isset($_POST['document_type'])) {
                $result = $upload->uploadDocument(
                    $_FILES['document'],
                    $_POST['enrollment_id'],
                    $_POST['document_type']
                );
                echo json_encode($result);
            } else {
                echo json_encode(['success' => false, 'message' => 'Missing required parameters']);
            }
            break;
            
        case 'delete':
            $data = json_decode(file_get_contents('php://input'), true);
            if (isset($data['document_id'])) {
                $result = $upload->deleteDocument($data['document_id']);
                echo json_encode($result);
            } else {
                echo json_encode(['success' => false, 'message' => 'Document ID required']);
            }
            break;
            
        case 'verify':
            $data = json_decode(file_get_contents('php://input'), true);
            if (isset($data['document_id'])) {
                session_start();
                $adminId = $_SESSION['admin_id'] ?? null;
                if ($adminId) {
                    $result = $upload->verifyDocument($data['document_id'], $adminId);
                    echo json_encode($result);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Authentication required']);
                }
            } else {
                echo json_encode(['success' => false, 'message' => 'Document ID required']);
            }
            break;
            
        default:
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
} elseif ($method === 'GET') {
    $action = $_GET['action'] ?? '';
    
    switch ($action) {
        case 'list':
            if (isset($_GET['enrollment_id'])) {
                $result = $upload->getDocuments($_GET['enrollment_id']);
                echo json_encode($result);
            } else {
                echo json_encode(['success' => false, 'message' => 'Enrollment ID required']);
            }
            break;
            
        default:
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>
