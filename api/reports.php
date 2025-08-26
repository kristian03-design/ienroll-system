<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once '../config/database.php';

class Reports {
    private $conn;
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    public function getDashboardStats() {
        try {
            $stats = [];
            
            // Total enrollments
            $query = "SELECT COUNT(*) as total FROM enrollment_applications";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $stats['total_enrollments'] = $stmt->fetch()['total'];
            
            // Enrollments by status
            $query = "SELECT enrollment_status, COUNT(*) as count FROM enrollment_applications GROUP BY enrollment_status";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $stats['by_status'] = [];
            while ($row = $stmt->fetch()) {
                $stats['by_status'][$row['enrollment_status']] = $row['count'];
            }
            
            // Queue statistics
            $query = "SELECT queue_status, COUNT(*) as count FROM queue_items WHERE queue_status != 'completed' GROUP BY queue_status";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $stats['queue_stats'] = [];
            while ($row = $stmt->fetch()) {
                $stats['queue_stats'][$row['queue_status']] = $row['count'];
            }
            
            // Recent enrollments (last 7 days)
            $query = "SELECT COUNT(*) as count FROM enrollment_applications WHERE application_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $stats['recent_enrollments'] = $stmt->fetch()['count'];
            
            // Average processing time
            $query = "SELECT AVG(actual_wait_time) as avg_time FROM queue_items WHERE actual_wait_time > 0";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $stats['avg_processing_time'] = round($stmt->fetch()['avg_time'] ?? 0, 2);
            
            return [
                'success' => true,
                'data' => $stats
            ];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Failed to fetch dashboard stats: ' . $e->getMessage()];
        }
    }
    
    public function getEnrollmentTrends($period = 'monthly') {
        try {
            $groupBy = '';
            $dateFormat = '';
            
            switch ($period) {
                case 'daily':
                    $groupBy = 'DATE(application_date)';
                    $dateFormat = '%Y-%m-%d';
                    break;
                case 'weekly':
                    $groupBy = 'YEARWEEK(application_date)';
                    $dateFormat = '%Y-%u';
                    break;
                case 'monthly':
                default:
                    $groupBy = 'DATE_FORMAT(application_date, "%Y-%m")';
                    $dateFormat = '%Y-%m';
                    break;
            }
            
            $query = "SELECT 
                        $groupBy as period,
                        COUNT(*) as count,
                        SUM(CASE WHEN enrollment_status = 'approved' THEN 1 ELSE 0 END) as approved,
                        SUM(CASE WHEN enrollment_status = 'rejected' THEN 1 ELSE 0 END) as rejected,
                        SUM(CASE WHEN enrollment_status = 'pending' THEN 1 ELSE 0 END) as pending
                     FROM enrollment_applications 
                     WHERE application_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
                     GROUP BY $groupBy
                     ORDER BY period DESC";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            
            return [
                'success' => true,
                'data' => $stmt->fetchAll()
            ];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Failed to fetch enrollment trends: ' . $e->getMessage()];
        }
    }
    
    public function getGradeLevelStats() {
        try {
            $query = "SELECT 
                        grade_level,
                        COUNT(*) as total,
                        SUM(CASE WHEN enrollment_status = 'approved' THEN 1 ELSE 0 END) as approved,
                        SUM(CASE WHEN enrollment_status = 'rejected' THEN 1 ELSE 0 END) as rejected,
                        SUM(CASE WHEN enrollment_status = 'pending' THEN 1 ELSE 0 END) as pending
                     FROM enrollment_applications 
                     GROUP BY grade_level
                     ORDER BY 
                        CASE grade_level
                            WHEN 'grade11' THEN 12
                            WHEN 'grade12' THEN 13
                            WHEN 'college' THEN 14
                        END";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            
            return [
                'success' => true,
                'data' => $stmt->fetchAll()
            ];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Failed to fetch grade level stats: ' . $e->getMessage()];
        }
    }
    
    public function getQueueAnalytics() {
        try {
            $analytics = [];
            
            // Queue performance by priority
            $query = "SELECT 
                        priority_level,
                        COUNT(*) as total,
                        AVG(actual_wait_time) as avg_wait_time,
                        MAX(actual_wait_time) as max_wait_time,
                        MIN(actual_wait_time) as min_wait_time
                     FROM queue_items 
                     WHERE actual_wait_time > 0
                     GROUP BY priority_level";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $analytics['by_priority'] = $stmt->fetchAll();
            
            // Daily queue volume
            $query = "SELECT 
                        DATE(created_at) as date,
                        COUNT(*) as count
                     FROM queue_items 
                     WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                     GROUP BY DATE(created_at)
                     ORDER BY date DESC";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $analytics['daily_volume'] = $stmt->fetchAll();
            
            // Processing efficiency
            $query = "SELECT 
                        DATE(completed_at) as date,
                        COUNT(*) as completed,
                        AVG(actual_wait_time) as avg_time
                     FROM queue_items 
                     WHERE completed_at IS NOT NULL 
                     AND completed_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                     GROUP BY DATE(completed_at)
                     ORDER BY date DESC";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $analytics['processing_efficiency'] = $stmt->fetchAll();
            
            return [
                'success' => true,
                'data' => $analytics
            ];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Failed to fetch queue analytics: ' . $e->getMessage()];
        }
    }
    
    public function getAdminActivityLogs($limit = 50) {
        try {
            $query = "SELECT 
                        al.*,
                        au.username as admin_username,
                        au.full_name as admin_name
                     FROM activity_logs al
                     LEFT JOIN admin_users au ON al.user_id = au.id
                     WHERE al.user_type = 'admin'
                     ORDER BY al.created_at DESC
                     LIMIT ?";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$limit]);
            
            return [
                'success' => true,
                'data' => $stmt->fetchAll()
            ];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Failed to fetch activity logs: ' . $e->getMessage()];
        }
    }
    
    public function generateEnrollmentReport($filters = []) {
        try {
            $whereClause = "WHERE 1=1";
            $params = [];
            
            if (isset($filters['start_date'])) {
                $whereClause .= " AND ea.application_date >= ?";
                $params[] = $filters['start_date'];
            }
            
            if (isset($filters['end_date'])) {
                $whereClause .= " AND ea.application_date <= ?";
                $params[] = $filters['end_date'];
            }
            
            if (isset($filters['status'])) {
                $whereClause .= " AND ea.enrollment_status = ?";
                $params[] = $filters['status'];
            }
            
            if (isset($filters['grade_level'])) {
                $whereClause .= " AND ea.grade_level = ?";
                $params[] = $filters['grade_level'];
            }
            
            $query = "SELECT 
                        ea.*,
                        s.first_name,
                        s.last_name,
                        s.student_number,
                        s.email,
                        s.phone,
                        qi.queue_number,
                        qi.queue_status,
                        au.username as processed_by_username
                     FROM enrollment_applications ea
                     JOIN students s ON ea.student_id = s.id
                     LEFT JOIN queue_items qi ON ea.id = qi.enrollment_id
                     LEFT JOIN admin_users au ON ea.processed_by = au.id
                     $whereClause
                     ORDER BY ea.application_date DESC";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute($params);
            
            return [
                'success' => true,
                'data' => $stmt->fetchAll()
            ];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Failed to generate report: ' . $e->getMessage()];
        }
    }
}

// Handle requests
$database = new Database();
$db = $database->getConnection();
$reports = new Reports($db);

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $action = $_GET['action'] ?? '';
    
    switch ($action) {
        case 'dashboard_stats':
            $result = $reports->getDashboardStats();
            echo json_encode($result);
            break;
            
        case 'enrollment_trends':
            $period = $_GET['period'] ?? 'monthly';
            $result = $reports->getEnrollmentTrends($period);
            echo json_encode($result);
            break;
            
        case 'grade_level_stats':
            $result = $reports->getGradeLevelStats();
            echo json_encode($result);
            break;
            
        case 'queue_analytics':
            $result = $reports->getQueueAnalytics();
            echo json_encode($result);
            break;
            
        case 'activity_logs':
            $limit = $_GET['limit'] ?? 50;
            $result = $reports->getAdminActivityLogs($limit);
            echo json_encode($result);
            break;
            
        case 'enrollment_report':
            $filters = $_GET;
            unset($filters['action']);
            $result = $reports->generateEnrollmentReport($filters);
            echo json_encode($result);
            break;
            
        default:
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>
