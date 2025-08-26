<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once '../config/database.php';

class Queue {
    private $conn;
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    public function getQueueList($filters = []) {
        try {
            $whereClause = "WHERE qi.queue_status != 'completed'";
            $params = [];
            
            if (isset($filters['status'])) {
                $whereClause .= " AND qi.queue_status = ?";
                $params[] = $filters['status'];
            }
            
            if (isset($filters['priority'])) {
                $whereClause .= " AND qi.priority_level = ?";
                $params[] = $filters['priority'];
            }
            
            $query = "SELECT qi.*, ea.*, s.first_name, s.last_name, s.student_number, s.email, s.phone
                     FROM queue_items qi
                     JOIN enrollment_applications ea ON qi.enrollment_id = ea.id
                     JOIN students s ON ea.student_id = s.id
                     $whereClause
                     ORDER BY 
                        CASE qi.priority_level 
                            WHEN 'high' THEN 1 
                            WHEN 'medium' THEN 2 
                            WHEN 'low' THEN 3 
                        END,
                        qi.created_at ASC";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute($params);
            
            return [
                'success' => true,
                'data' => $stmt->fetchAll()
            ];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Failed to fetch queue: ' . $e->getMessage()];
        }
    }
    
    public function startProcessing($queueId, $adminId) {
        try {
            $query = "UPDATE queue_items SET queue_status = 'processing', assigned_to = ?, started_at = NOW() WHERE id = ? AND queue_status = 'waiting'";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$adminId, $queueId]);
            
            if ($stmt->rowCount() > 0) {
                return ['success' => true, 'message' => 'Queue item started processing'];
            } else {
                return ['success' => false, 'message' => 'Queue item not found or already being processed'];
            }
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Failed to start processing: ' . $e->getMessage()];
        }
    }
    
    public function completeProcessing($queueId, $adminId) {
        try {
            $query = "UPDATE queue_items SET queue_status = 'completed', completed_at = NOW() WHERE id = ? AND assigned_to = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$queueId, $adminId]);
            
            if ($stmt->rowCount() > 0) {
                // Calculate actual wait time
                $this->calculateWaitTime($queueId);
                return ['success' => true, 'message' => 'Queue item completed'];
            } else {
                return ['success' => false, 'message' => 'Queue item not found or not assigned to you'];
            }
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Failed to complete processing: ' . $e->getMessage()];
        }
    }
    
    public function cancelQueueItem($queueId, $adminId, $reason = '') {
        try {
            $query = "UPDATE queue_items SET queue_status = 'cancelled', completed_at = NOW() WHERE id = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$queueId]);
            
            if ($stmt->rowCount() > 0) {
                return ['success' => true, 'message' => 'Queue item cancelled'];
            } else {
                return ['success' => false, 'message' => 'Queue item not found'];
            }
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Failed to cancel queue item: ' . $e->getMessage()];
        }
    }
    
    public function getQueueStats() {
        try {
            $query = "SELECT 
                        queue_status,
                        priority_level,
                        COUNT(*) as count
                     FROM queue_items 
                     WHERE queue_status != 'completed'
                     GROUP BY queue_status, priority_level";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            
            $stats = [
                'total_waiting' => 0,
                'total_processing' => 0,
                'by_priority' => [
                    'high' => 0,
                    'medium' => 0,
                    'low' => 0
                ]
            ];
            
            while ($row = $stmt->fetch()) {
                if ($row['queue_status'] === 'waiting') {
                    $stats['total_waiting'] += $row['count'];
                } elseif ($row['queue_status'] === 'processing') {
                    $stats['total_processing'] += $row['count'];
                }
                $stats['by_priority'][$row['priority_level']] += $row['count'];
            }
            
            // Get estimated wait times
            $stats['estimated_wait_times'] = $this->getEstimatedWaitTimes();
            
            return [
                'success' => true,
                'data' => $stats
            ];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Failed to fetch queue stats: ' . $e->getMessage()];
        }
    }
    
    public function getMyQueue($adminId) {
        try {
            $query = "SELECT qi.*, ea.*, s.first_name, s.last_name, s.student_number, s.email, s.phone
                     FROM queue_items qi
                     JOIN enrollment_applications ea ON qi.enrollment_id = ea.id
                     JOIN students s ON ea.student_id = s.id
                     WHERE qi.assigned_to = ? AND qi.queue_status = 'processing'
                     ORDER BY qi.started_at ASC";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$adminId]);
            
            return [
                'success' => true,
                'data' => $stmt->fetchAll()
            ];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Failed to fetch your queue: ' . $e->getMessage()];
        }
    }
    
    public function getNextInQueue() {
        try {
            $query = "SELECT qi.*, ea.*, s.first_name, s.last_name, s.student_number, s.email, s.phone
                     FROM queue_items qi
                     JOIN enrollment_applications ea ON qi.enrollment_id = ea.id
                     JOIN students s ON ea.student_id = s.id
                     WHERE qi.queue_status = 'waiting'
                     ORDER BY 
                        CASE qi.priority_level 
                            WHEN 'high' THEN 1 
                            WHEN 'medium' THEN 2 
                            WHEN 'low' THEN 3 
                        END,
                        qi.created_at ASC
                     LIMIT 1";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            
            if ($stmt->rowCount() > 0) {
                return [
                    'success' => true,
                    'data' => $stmt->fetch()
                ];
            } else {
                return [
                    'success' => true,
                    'data' => null,
                    'message' => 'No items in queue'
                ];
            }
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Failed to get next in queue: ' . $e->getMessage()];
        }
    }
    
    private function calculateWaitTime($queueId) {
        try {
            $query = "SELECT created_at, completed_at FROM queue_items WHERE id = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$queueId]);
            $item = $stmt->fetch();
            
            if ($item && $item['completed_at']) {
                $created = new DateTime($item['created_at']);
                $completed = new DateTime($item['completed_at']);
                $waitTime = $completed->diff($created)->i + ($completed->diff($created)->h * 60);
                
                $updateQuery = "UPDATE queue_items SET actual_wait_time = ? WHERE id = ?";
                $updateStmt = $this->conn->prepare($updateQuery);
                $updateStmt->execute([$waitTime, $queueId]);
            }
        } catch (Exception $e) {
            // Log error silently
        }
    }
    
    private function getEstimatedWaitTimes() {
        try {
            // Get average processing time
            $query = "SELECT AVG(actual_wait_time) as avg_time FROM queue_items WHERE actual_wait_time > 0";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $result = $stmt->fetch();
            $avgTime = $result['avg_time'] ?? 15; // Default 15 minutes
            
            // Get current queue counts by priority
            $queueQuery = "SELECT priority_level, COUNT(*) as count FROM queue_items WHERE queue_status = 'waiting' GROUP BY priority_level";
            $queueStmt = $this->conn->prepare($queueQuery);
            $queueStmt->execute();
            
            $estimates = [];
            while ($row = $queueStmt->fetch()) {
                $estimates[$row['priority_level']] = $row['count'] * $avgTime;
            }
            
            return $estimates;
            
        } catch (Exception $e) {
            return ['high' => 0, 'medium' => 0, 'low' => 0];
        }
    }
}

// Handle requests
$database = new Database();
$db = $database->getConnection();
$queue = new Queue($db);

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $action = $_GET['action'] ?? '';
    
    switch ($action) {
        case 'start_processing':
            if (isset($data['queue_id'])) {
                session_start();
                $adminId = $_SESSION['admin_id'] ?? null;
                if ($adminId) {
                    $result = $queue->startProcessing($data['queue_id'], $adminId);
                    echo json_encode($result);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Authentication required']);
                }
            } else {
                echo json_encode(['success' => false, 'message' => 'Queue ID required']);
            }
            break;
            
        case 'complete_processing':
            if (isset($data['queue_id'])) {
                session_start();
                $adminId = $_SESSION['admin_id'] ?? null;
                if ($adminId) {
                    $result = $queue->completeProcessing($data['queue_id'], $adminId);
                    echo json_encode($result);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Authentication required']);
                }
            } else {
                echo json_encode(['success' => false, 'message' => 'Queue ID required']);
            }
            break;
            
        case 'cancel':
            if (isset($data['queue_id'])) {
                session_start();
                $adminId = $_SESSION['admin_id'] ?? null;
                $result = $queue->cancelQueueItem($data['queue_id'], $adminId, $data['reason'] ?? '');
                echo json_encode($result);
            } else {
                echo json_encode(['success' => false, 'message' => 'Queue ID required']);
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
            $result = $queue->getQueueList($filters);
            echo json_encode($result);
            break;
            
        case 'stats':
            $result = $queue->getQueueStats();
            echo json_encode($result);
            break;
            
        case 'my_queue':
            session_start();
            $adminId = $_SESSION['admin_id'] ?? null;
            if ($adminId) {
                $result = $queue->getMyQueue($adminId);
                echo json_encode($result);
            } else {
                echo json_encode(['success' => false, 'message' => 'Authentication required']);
            }
            break;
            
        case 'next':
            $result = $queue->getNextInQueue();
            echo json_encode($result);
            break;
            
        default:
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>
