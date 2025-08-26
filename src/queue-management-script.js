// Sample queue data
let queueData = [
  {
    id: 1,
    number: "A001",
    studentName: "Maria Santos",
    serviceType: "Enrollment",
    priority: "high",
    status: "current",
    waitTime: "0 min",
    notes: "Documents pending verification",
    timestamp: "09:15 AM",
    joinTime: new Date(),
  },
  {
    id: 2,
    number: "A002",
    studentName: "John Doe",
    serviceType: "Registration",
    priority: "medium",
    status: "waiting",
    waitTime: "5 min",
    notes: "Regular registration",
    timestamp: "09:20 AM",
    joinTime: new Date(),
  },
  {
    id: 3,
    number: "A003",
    studentName: "Jane Smith",
    serviceType: "Academic Advising",
    priority: "low",
    status: "waiting",
    waitTime: "10 min",
    notes: "Course planning",
    timestamp: "09:25 AM",
    joinTime: new Date(),
  },
  {
    id: 4,
    number: "A004",
    studentName: "Carlos Rodriguez",
    serviceType: "Financial Aid",
    priority: "high",
    status: "waiting",
    waitTime: "15 min",
    notes: "Urgent financial assistance needed",
    timestamp: "09:30 AM",
    joinTime: new Date(),
  },
  {
    id: 5,
    number: "A005",
    studentName: "Lisa Chen",
    serviceType: "Transcript Request",
    priority: "medium",
    status: "waiting",
    waitTime: "20 min",
    notes: "Official transcript needed",
    timestamp: "09:35 AM",
    joinTime: new Date(),
  },
];

let queueStatus = "active";
let currentNumber = null;
let nextNumber = null;
let queueCounter = 6;

// Initialize the page
document.addEventListener("DOMContentLoaded", function () {
  populateQueueTable();
  setupEventListeners();
  updateQueueStatus();
  startQueueTimer();
  initializeAnalytics();
  populateHistoryTable();
  setupAdvancedFeatures();
});

function setupAdvancedFeatures() {
  // Bulk operations
  document
    .getElementById("selectAll")
    .addEventListener("change", toggleSelectAll);
  document
    .getElementById("bulkPrioritize")
    .addEventListener("click", bulkPrioritize);
  document.getElementById("bulkRemove").addEventListener("click", bulkRemove);
  document.getElementById("bulkExport").addEventListener("click", bulkExport);

  // Advanced filters
  document
    .getElementById("serviceTypeFilter")
    .addEventListener("change", applyAdvancedFilters);
  document
    .getElementById("waitTimeFilter")
    .addEventListener("change", applyAdvancedFilters);
  document
    .getElementById("dateFilter")
    .addEventListener("change", applyAdvancedFilters);

  // Analytics
  document
    .getElementById("analyticsPeriod")
    .addEventListener("change", updateAnalytics);
  document
    .getElementById("exportAnalytics")
    .addEventListener("click", exportAnalyticsData);

  // History management
  document
    .getElementById("clearHistory")
    .addEventListener("click", clearHistory);
  document
    .getElementById("exportHistory")
    .addEventListener("click", exportHistoryData);

  // Automated rules
  document
    .getElementById("saveCustomRules")
    .addEventListener("click", saveCustomRules);

  // Integration settings
  document
    .getElementById("testIntegration")
    .addEventListener("click", testIntegration);
  document
    .getElementById("saveIntegration")
    .addEventListener("click", saveIntegrationSettings);

  // Notifications panel
  document
    .getElementById("floatingActionBtn")
    .addEventListener("click", toggleNotificationsPanel);
}

// Analytics Functions
function initializeAnalytics() {
  // Initialize Chart.js if available
  if (typeof Chart !== "undefined") {
    createQueueFlowChart();
    createServiceTypeChart();
    createWaitTimeChart();
    createPriorityChart();
  }
  updatePerformanceMetrics();
}

function createQueueFlowChart() {
  const ctx = document.getElementById("queueFlowChart");
  if (ctx) {
    new Chart(ctx, {
      type: "line",
      data: {
        labels: [
          "9:00",
          "10:00",
          "11:00",
          "12:00",
          "1:00",
          "2:00",
          "3:00",
          "4:00",
        ],
        datasets: [
          {
            label: "Queue Length",
            data: [15, 28, 35, 42, 38, 31, 25, 18],
            borderColor: "#00BFFF",
            backgroundColor: "rgba(0, 191, 255, 0.1)",
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: { beginAtZero: true },
        },
      },
    });
  }
}

function createServiceTypeChart() {
  const ctx = document.getElementById("serviceTypeChart");
  if (ctx) {
    new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: [
          "Enrollment",
          "Registration",
          "Advising",
          "Financial Aid",
          "Transcript",
        ],
        datasets: [
          {
            data: [35, 25, 20, 15, 5],
            backgroundColor: [
              "#00BFFF",
              "#f59e0b",
              "#14b8a6",
              "#8b5cf6",
              "#ef4444",
            ],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "bottom" },
        },
      },
    });
  }
}

function createWaitTimeChart() {
  const ctx = document.getElementById("waitTimeChart");
  if (ctx) {
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["0-15min", "15-30min", "30-60min", "60+min"],
        datasets: [
          {
            label: "Students",
            data: [45, 28, 15, 8],
            backgroundColor: ["#10b981", "#f59e0b", "#f97316", "#ef4444"],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: { beginAtZero: true },
        },
      },
    });
  }
}

function createPriorityChart() {
  const ctx = document.getElementById("priorityChart");
  if (ctx) {
    new Chart(ctx, {
      type: "pie",
      data: {
        labels: ["High", "Medium", "Low"],
        datasets: [
          {
            data: [25, 45, 30],
            backgroundColor: ["#ef4444", "#f59e0b", "#10b981"],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "bottom" },
        },
      },
    });
  }
}

function updatePerformanceMetrics() {
  const totalStudents = queueData.length;
  const processedToday = Math.floor(Math.random() * 20) + 25;
  const avgWaitTime = Math.floor(Math.random() * 15) + 15;
  const satisfaction = (Math.random() * 0.6 + 3.8).toFixed(1);

  document.getElementById("peakHour").textContent = "9:00 AM - 11:00 AM";
  document.getElementById(
    "avgProcessingTime"
  ).textContent = `${avgWaitTime} min`;
  document.getElementById("queueEfficiency").textContent = `${
    Math.floor(Math.random() * 20) + 75
  }%`;
  document.getElementById("satisfaction").textContent = `${satisfaction}/5`;
}

// Bulk Operations
function toggleSelectAll() {
  const checkboxes = document.querySelectorAll('input[name="queueSelect"]');
  const selectAll = document.getElementById("selectAll");
  checkboxes.forEach((checkbox) => {
    checkbox.checked = selectAll.checked;
  });
}

function bulkPrioritize() {
  const selectedStudents = getSelectedStudents();
  if (selectedStudents.length === 0) {
    showNotification("Please select students to prioritize", "warning");
    return;
  }

  selectedStudents.forEach((id) => {
    const student = queueData.find((s) => s.id === id);
    if (student) student.priority = "high";
  });

  populateQueueTable();
  showNotification(
    `${selectedStudents.length} students prioritized successfully`,
    "success"
  );
  addToHistory(
    "Bulk Prioritize",
    `${selectedStudents.length} students`,
    "Admin"
  );
}

function bulkRemove() {
  const selectedStudents = getSelectedStudents();
  if (selectedStudents.length === 0) {
    showNotification("Please select students to remove", "warning");
    return;
  }

  if (
    confirm(
      `Are you sure you want to remove ${selectedStudents.length} students from the queue?`
    )
  ) {
    queueData = queueData.filter((item) => !selectedStudents.includes(item.id));
    populateQueueTable();
    showNotification(
      `${selectedStudents.length} students removed successfully`,
      "success"
    );
    addToHistory("Bulk Remove", `${selectedStudents.length} students`, "Admin");
  }
}

function bulkExport() {
  const selectedStudents = getSelectedStudents();
  if (selectedStudents.length === 0) {
    showNotification("Please select students to export", "warning");
    return;
  }

  const selectedData = queueData.filter((item) =>
    selectedStudents.includes(item.id)
  );
  const csvContent = generateCSV(selectedData);
  downloadCSV(
    csvContent,
    `selected_queue_data_${new Date().toISOString().split("T")[0]}.csv`
  );
  showNotification("Selected data exported successfully", "success");
}

function getSelectedStudents() {
  const checkboxes = document.querySelectorAll(
    'input[name="queueSelect"]:checked'
  );
  return Array.from(checkboxes).map((cb) => parseInt(cb.value));
}

// Advanced Filtering
function applyAdvancedFilters() {
  const serviceType = document.getElementById("serviceTypeFilter").value;
  const waitTime = document.getElementById("waitTimeFilter").value;
  const date = document.getElementById("dateFilter").value;

  let filteredData = queueData;

  if (serviceType) {
    filteredData = filteredData.filter(
      (item) => item.serviceType === serviceType
    );
  }

  if (waitTime) {
    filteredData = filteredData.filter((item) => {
      const waitMinutes = parseInt(item.waitTime);
      switch (waitTime) {
        case "0-15":
          return waitMinutes >= 0 && waitMinutes <= 15;
        case "15-30":
          return waitMinutes > 15 && waitMinutes <= 30;
        case "30-60":
          return waitMinutes > 30 && waitMinutes <= 60;
        case "60+":
          return waitMinutes > 60;
        default:
          return true;
      }
    });
  }

  if (date) {
    filteredData = filteredData.filter((item) => {
      const itemDate = new Date(item.joinTime).toISOString().split("T")[0];
      return itemDate === date;
    });
  }

  populateFilteredQueueTable(filteredData);
}

// Queue History Management
let queueHistory = [
  {
    timestamp: new Date(),
    action: "Queue Started",
    student: "System",
    details: "Queue management system initialized",
    admin: "System",
  },
  {
    timestamp: new Date(Date.now() - 300000),
    action: "Student Added",
    student: "Maria Santos",
    details: "Added to queue with high priority",
    admin: "Admin",
  },
  {
    timestamp: new Date(Date.now() - 600000),
    action: "Priority Changed",
    student: "John Doe",
    details: "Priority upgraded to high",
    admin: "Admin",
  },
];

function populateHistoryTable() {
  const tbody = document.getElementById("historyTableBody");
  tbody.innerHTML = "";

  queueHistory.forEach((entry) => {
    const row = document.createElement("tr");
    row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${entry.timestamp.toLocaleTimeString()}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${entry.action}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${entry.student}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${entry.details}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${entry.admin}
                    </td>
                `;
    tbody.appendChild(row);
  });
}

function addToHistory(action, details, admin) {
  const historyEntry = {
    timestamp: new Date(),
    action: action,
    student: "Multiple",
    details: details,
    admin: admin,
  };
  queueHistory.unshift(historyEntry);
  if (queueHistory.length > 100) queueHistory.pop(); // Keep only last 100 entries
  populateHistoryTable();
}

function clearHistory() {
  if (
    confirm(
      "Are you sure you want to clear all queue history? This action cannot be undone."
    )
  ) {
    queueHistory = [];
    populateHistoryTable();
    showNotification("Queue history cleared successfully", "success");
  }
}

function exportHistoryData() {
  const csvContent = generateHistoryCSV();
  downloadCSV(
    csvContent,
    `queue_history_${new Date().toISOString().split("T")[0]}.csv`
  );
  showNotification("Queue history exported successfully", "success");
}

function generateHistoryCSV() {
  const headers = ["Timestamp", "Action", "Student", "Details", "Admin"];
  const csvRows = [headers.join(",")];

  queueHistory.forEach((entry) => {
    const row = [
      entry.timestamp.toLocaleString(),
      entry.action,
      entry.student,
      entry.details,
      entry.admin,
    ];
    csvRows.push(row.join(","));
  });

  return csvRows.join("\n");
}

// Automated Rules
function saveCustomRules() {
  const customPriority = document.getElementById("customPriorityRule").value;
  const notificationThreshold = document.getElementById(
    "notificationThreshold"
  ).value;

  // Save rules to localStorage or send to server
  localStorage.setItem(
    "queueCustomRules",
    JSON.stringify({
      customPriority,
      notificationThreshold,
      timestamp: new Date().toISOString(),
    })
  );

  showNotification("Custom rules saved successfully", "success");
  addToHistory(
    "Custom Rules Updated",
    `Priority: ${customPriority}, Threshold: ${notificationThreshold}min`,
    "Admin"
  );
}

// External System Integration
function testIntegration() {
  showNotification("Testing system integration...", "info");

  // Simulate integration test
  setTimeout(() => {
    const smsEnabled = document.getElementById("smsIntegration").checked;
    const emailEnabled = document.getElementById("emailIntegration").checked;
    const portalEnabled = document.getElementById("portalIntegration").checked;
    const dbEnabled = document.getElementById("dbIntegration").checked;

    let testResults = [];
    if (smsEnabled) testResults.push("SMS: ✓ Connected");
    if (emailEnabled) testResults.push("Email: ✓ Connected");
    if (portalEnabled) testResults.push("Portal: ✓ Connected");
    if (dbEnabled) testResults.push("Database: ✓ Connected");

    showNotification(
      `Integration test completed: ${testResults.join(", ")}`,
      "success"
    );
  }, 2000);
}

function saveIntegrationSettings() {
  showNotification("Integration settings saved successfully", "success");
  addToHistory(
    "Integration Settings Updated",
    "External system configuration saved",
    "Admin"
  );
}

// Notifications Panel
function toggleNotificationsPanel() {
  const panel = document.getElementById("notificationsPanel");
  panel.classList.toggle("hidden");
}

// Enhanced notification system
function showAdvancedNotification(message, type = "info", duration = 5000) {
  const notification = document.createElement("div");
  notification.className = `p-4 rounded-lg shadow-lg text-white fade-in slide-in ${
    type === "success"
      ? "bg-green-500"
      : type === "warning"
      ? "bg-yellow-500"
      : type === "error"
      ? "bg-red-500"
      : "bg-blue-500"
  }`;

  const icon = getNotificationIcon(type);
  notification.innerHTML = `
                <div class="flex items-center">
                    ${icon}
                    <span class="ml-2">${message}</span>
                </div>
            `;

  document.getElementById("notificationContainer").appendChild(notification);

  // Add to notifications panel
  addToNotificationsPanel(message, type);

  setTimeout(() => {
    notification.remove();
  }, duration);
}

function getNotificationIcon(type) {
  const icons = {
    success:
      '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>',
    warning:
      '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"></path></svg>',
    error:
      '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>',
    info: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
  };
  return icons[type] || icons.info;
}

function addToNotificationsPanel(message, type) {
  const notificationsList = document.getElementById("notificationsList");
  const notificationItem = document.createElement("div");
  notificationItem.className = `p-3 mb-2 rounded-lg ${
    type === "success"
      ? "bg-green-50 border border-green-200"
      : type === "warning"
      ? "bg-yellow-50 border border-yellow-200"
      : type === "error"
      ? "bg-red-50 border border-red-200"
      : "bg-blue-50 border border-blue-200"
  }`;

  notificationItem.innerHTML = `
                <div class="flex items-start">
                    ${getNotificationIcon(type)}
                    <div class="ml-2 flex-1">
                        <p class="text-sm text-gray-800">${message}</p>
                        <p class="text-xs text-gray-500 mt-1">${new Date().toLocaleTimeString()}</p>
                    </div>
                </div>
            `;

  notificationsList.insertBefore(
    notificationItem,
    notificationsList.firstChild
  );

  // Keep only last 20 notifications
  if (notificationsList.children.length > 20) {
    notificationsList.removeChild(notificationsList.lastChild);
  }
}

// Analytics export
function exportAnalyticsData() {
  const period = document.getElementById("analyticsPeriod").value;
  showNotification(`Exporting ${period} analytics data...`, "info");

  // Simulate export process
  setTimeout(() => {
    const csvContent = generateAnalyticsCSV();
    downloadCSV(
      csvContent,
      `queue_analytics_${period}_${new Date().toISOString().split("T")[0]}.csv`
    );
    showNotification("Analytics data exported successfully", "success");
  }, 1500);
}

function generateAnalyticsCSV() {
  const headers = ["Metric", "Value", "Period"];
  const csvRows = [headers.join(",")];

  const metrics = [
    ["Total Students", queueData.length, "Current"],
    ["Average Wait Time", "18 min", "Today"],
    ["Peak Hour", "9:00 AM - 11:00 AM", "Today"],
    ["Queue Efficiency", "85%", "Today"],
  ];

  metrics.forEach((row) => {
    csvRows.push(row.join(","));
  });

  return csvRows.join("\n");
}

function downloadCSV(content, filename) {
  const blob = new Blob([content], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

// Enhanced queue table with checkboxes
function populateQueueTable() {
  const tbody = document.getElementById("queue-table-body");
  tbody.innerHTML = "";

  queueData.forEach((student, index) => {
    const row = document.createElement("tr");
    row.className = index % 2 === 0 ? "bg-white" : "bg-gray-50";
    row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap">
                        <input type="checkbox" name="queueSelect" value="${
                          student.id
                        }" class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded">
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="text-lg font-bold text-primary">${
                          student.number
                        }</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">${
                          student.studentName
                        }</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">${
                          student.serviceType
                        }</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full priority-${
                          student.priority
                        } text-white">
                            ${
                              student.priority.charAt(0).toUpperCase() +
                              student.priority.slice(1)
                            }
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">${
                          student.waitTime
                        }</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          student.status
                        )}">
                            ${
                              student.status.charAt(0).toUpperCase() +
                              student.status.slice(1)
                            }
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onclick="viewQueueDetails(${
                          student.id
                        })" class="text-primary hover:text-primary/80 mr-3">View</button>
                        <button onclick="prioritizeStudent(${
                          student.id
                        })" class="text-accent hover:text-accent/80">Prioritize</button>
                        <button onclick="removeFromQueue(${
                          student.id
                        })" class="text-red-600 hover:text-red-800 ml-2">Remove</button>
                    </td>
                `;
    tbody.appendChild(row);
  });

  // Also populate the main queue table
  populateMainQueueTable();
}

function setupEventListeners() {
  // Queue control buttons
  document
    .getElementById("startQueueBtn")
    .addEventListener("click", startQueue);
  document
    .getElementById("pauseQueueBtn")
    .addEventListener("click", pauseQueue);
  document
    .getElementById("clearQueueBtn")
    .addEventListener("click", clearQueue);

  // Filter functionality
  document
    .getElementById("priorityFilter")
    .addEventListener("change", filterQueue);

  // Export functionality
  document
    .getElementById("exportQueueBtn")
    .addEventListener("click", exportQueueData);

  // Form submission
  document
    .getElementById("addQueueForm")
    .addEventListener("submit", handleAddToQueue);

  // Add to queue button
  document
    .getElementById("add-queue-btn")
    .addEventListener("click", openAddQueueModal);

  // Reorder queue button
  document
    .getElementById("reorder-queue-btn")
    .addEventListener("click", reorderQueue);

  // Tab functionality
  document
    .getElementById("queue-tab")
    .addEventListener("click", () => switchTab("queue"));
  document
    .getElementById("enrollment-tab")
    .addEventListener("click", () => switchTab("enrollment"));
  document
    .getElementById("reports-tab")
    .addEventListener("click", () => switchTab("reports"));
  document
    .getElementById("settings-tab")
    .addEventListener("click", () => switchTab("settings"));
}

function populateQueueTable() {
  const tbody = document.getElementById("queue-table-body");
  tbody.innerHTML = "";

  queueData.forEach((student, index) => {
    const row = document.createElement("tr");
    row.className = index % 2 === 0 ? "bg-white" : "bg-gray-50";
    row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="text-lg font-bold text-primary">${
                          student.number
                        }</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">${
                          student.studentName
                        }</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">${
                          student.serviceType
                        }</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full priority-${
                          student.priority
                        } text-white">
                            ${
                              student.priority.charAt(0).toUpperCase() +
                              student.priority.slice(1)
                            }
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">${
                          student.waitTime
                        }</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          student.status
                        )}">
                            ${
                              student.status.charAt(0).toUpperCase() +
                              student.status.slice(1)
                            }
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onclick="viewQueueDetails(${
                          student.id
                        })" class="text-primary hover:text-primary/80 mr-3">View</button>
                        <button onclick="prioritizeStudent(${
                          student.id
                        })" class="text-accent hover:text-accent/80">Prioritize</button>
                        <button onclick="removeFromQueue(${
                          student.id
                        })" class="text-red-600 hover:text-red-800 ml-2">Remove</button>
                    </td>
                `;
    tbody.appendChild(row);
  });

  // Also populate the main queue table
  populateMainQueueTable();
}

// Populate enrollment table
function populateEnrollmentTable() {
  const tbody = document.getElementById("enrollment-table-body");
  tbody.innerHTML = "";

  // Sample enrollment data for demonstration
  const enrollmentData = [
    {
      id: "EN001",
      name: "Maria Santos",
      program: "Computer Science",
      status: "Pending",
      date: "2024-01-15",
    },
    {
      id: "EN002",
      name: "John Doe",
      program: "Engineering",
      status: "Approved",
      date: "2024-01-14",
    },
    {
      id: "EN003",
      name: "Jane Smith",
      program: "Business",
      status: "Verified",
      date: "2024-01-13",
    },
  ];

  enrollmentData.forEach((student, index) => {
    const statusColors = {
      Pending: "bg-yellow-100 text-yellow-800",
      Approved: "bg-green-100 text-green-800",
      Verified: "bg-blue-100 text-blue-800",
      Rejected: "bg-red-100 text-red-800",
    };

    const row = document.createElement("tr");
    row.className = index % 2 === 0 ? "bg-white" : "bg-gray-50";
    row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${
                      student.id
                    }</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">${
                          student.name
                        }</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${
                      student.program
                    }</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          statusColors[student.status]
                        }">
                            ${student.status}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${
                      student.date
                    }</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onclick="viewEnrollmentDetails('${
                          student.id
                        }')" class="text-primary hover:text-primary/80 mr-3">View</button>
                        <button onclick="updateStatus('${
                          student.id
                        }')" class="text-accent hover:text-accent/80">Update</button>
                    </td>
                `;
    tbody.appendChild(row);
  });
}

// Queue modal functions
function viewQueueDetails(studentId) {
  const student = queueData.find((s) => s.id === studentId);
  if (student) {
    document.getElementById("queue-modal-content").innerHTML = `
                    <div class="space-y-4">
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Queue Number</label>
                                <p class="text-lg font-semibold text-primary">#${
                                  student.queueNum
                                }</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Student Name</label>
                                <p class="text-lg font-semibold text-gray-900">${
                                  student.name
                                }</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Program</label>
                                <p class="text-lg font-semibold text-gray-900">${
                                  student.program
                                }</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Priority Level</label>
                                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full priority-${
                                  student.priority
                                } text-white">
                                    ${
                                      student.priority.charAt(0).toUpperCase() +
                                      student.priority.slice(1)
                                    }
                                </span>
                            </div>
                        </div>
                        <div class="border-t pt-4">
                            <h4 class="text-md font-medium text-gray-900 mb-3">Actions</h4>
                            <div class="flex space-x-3">
                                <button class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                                    Process Now
                                </button>
                                <button class="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent/90 transition-colors">
                                    Prioritize
                                </button>
                                <button class="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors">
                                    Remove from Queue
                                </button>
                            </div>
                        </div>
                    </div>
                `;
    document.getElementById("queueModal").classList.remove("hidden");
  }
}

function closeQueueModal() {
  document.getElementById("queueModal").classList.add("hidden");
}

// Other functions
function prioritizeStudent(studentId) {
  const student = queueData.find((s) => s.id === studentId);
  if (student) {
    student.priority = "high";
    showNotification("Student prioritized successfully!", "success");
    populateQueueTable();
    updateQueueStatus();
  }
}

function viewEnrollmentDetails(studentId) {
  alert(`Viewing enrollment details for student ${studentId}`);
}

function updateStatus(studentId) {
  alert(`Updating status for student ${studentId}`);
}

// Queue Management Functions
function startQueue() {
  if (queueStatus === "paused") {
    queueStatus = "active";
    document.getElementById("queueStatus").textContent = "Active";
    document.getElementById("queueStatus").className =
      "text-3xl font-bold text-green-600";
    showNotification("Queue started successfully!", "success");
    startQueueTimer();
  } else {
    showNotification("Queue is already running!", "info");
  }
}

function pauseQueue() {
  if (queueStatus === "active") {
    queueStatus = "paused";
    document.getElementById("queueStatus").textContent = "Paused";
    document.getElementById("queueStatus").className =
      "text-3xl font-bold text-yellow-600";
    showNotification("Queue paused successfully!", "warning");
  } else {
    showNotification("Queue is already paused!", "info");
  }
}

function clearQueue() {
  if (
    confirm(
      "Are you sure you want to clear the entire queue? This action cannot be undone."
    )
  ) {
    queueData = [];
    queueCounter = 1;
    currentNumber = null;
    nextNumber = null;
    populateQueueTable();
    updateQueueStatus();
    showNotification("Queue cleared successfully!", "success");
  }
}

function filterQueue() {
  const priority = document.getElementById("priorityFilter").value;
  const filteredData = priority
    ? queueData.filter((item) => item.priority === priority)
    : queueData;
  populateFilteredQueueTable(filteredData);
}

function exportQueueData() {
  const csvContent = generateCSV(queueData);
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `queue_data_${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
  showNotification("Queue data exported successfully!", "success");
}

function openAddQueueModal() {
  document.getElementById("addQueueModal").classList.remove("hidden");
}

function closeAddQueueModal() {
  document.getElementById("addQueueModal").classList.add("hidden");
  document.getElementById("addQueueForm").reset();
}

function handleAddToQueue(e) {
  e.preventDefault();
  const formData = new FormData(e.target);

  const newQueueItem = {
    id: queueCounter++,
    number: `A${queueCounter.toString().padStart(3, "0")}`,
    studentName: formData.get("studentName"),
    serviceType: formData.get("serviceType"),
    priority: formData.get("priority"),
    status: "waiting",
    waitTime: "0 min",
    notes: formData.get("notes"),
    timestamp: new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    joinTime: new Date(),
  };

  queueData.push(newQueueItem);
  closeAddQueueModal();
  populateQueueTable();
  updateQueueStatus();
  showNotification("Student added to queue successfully!", "success");
}

function removeFromQueue(studentId) {
  if (confirm("Are you sure you want to remove this student from the queue?")) {
    queueData = queueData.filter((item) => item.id !== studentId);
    populateQueueTable();
    updateQueueStatus();
    showNotification("Student removed from queue successfully!", "success");
  }
}

function reorderQueue() {
  // Sort by priority (high, medium, low) then by join time
  queueData.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return a.joinTime - b.joinTime;
  });

  // Update queue numbers
  queueData.forEach((item, index) => {
    item.number = `A${(index + 1).toString().padStart(3, "0")}`;
  });

  populateQueueTable();
  updateQueueStatus();
  showNotification("Queue reordered successfully!", "success");
}

function viewQueueDetails(studentId) {
  const student = queueData.find((s) => s.id === studentId);
  if (student) {
    const content = `
                    <div class="space-y-4">
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Queue Number</label>
                                <p class="text-lg font-semibold text-primary">${
                                  student.number
                                }</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Student Name</label>
                                <p class="text-lg font-semibold text-gray-900">${
                                  student.studentName
                                }</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Service Type</label>
                                <p class="text-lg font-semibold text-gray-900">${
                                  student.serviceType
                                }</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Priority Level</label>
                                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full priority-${
                                  student.priority
                                } text-white">
                                    ${
                                      student.priority.charAt(0).toUpperCase() +
                                      student.priority.slice(1)
                                    }
                                </span>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Status</label>
                                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                  student.status
                                )}">
                                    ${
                                      student.status.charAt(0).toUpperCase() +
                                      student.status.slice(1)
                                    }
                                </span>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Wait Time</label>
                                <p class="text-lg font-semibold text-gray-900">${
                                  student.waitTime
                                }</p>
                            </div>
                        </div>
                        <div class="border-t pt-4">
                            <label class="block text-sm font-medium text-gray-700">Notes</label>
                            <p class="text-gray-900">${
                              student.notes || "No notes"
                            }</p>
                        </div>
                        <div class="border-t pt-4">
                            <h4 class="text-md font-medium text-gray-900 mb-3">Actions</h4>
                            <div class="flex space-x-3">
                                <button onclick="processStudent(${
                                  student.id
                                })" class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                                    Process Now
                                </button>
                                <button onclick="prioritizeStudent(${
                                  student.id
                                })" class="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent/90 transition-colors">
                                    Prioritize
                                </button>
                                <button onclick="removeFromQueue(${
                                  student.id
                                })" class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                                    Remove from Queue
                                </button>
                            </div>
                        </div>
                    </div>
                `;
    document.getElementById("queueDetailsContent").innerHTML = content;
    document.getElementById("queueDetailsModal").classList.remove("hidden");
  }
}

function closeQueueDetailsModal() {
  document.getElementById("queueDetailsModal").classList.add("hidden");
}

function processStudent(studentId) {
  const student = queueData.find((s) => s.id === studentId);
  if (student) {
    student.status = "processing";
    currentNumber = student.number;
    nextNumber = getNextNumber();
    populateQueueTable();
    updateQueueStatus();
    closeQueueDetailsModal();
    showNotification(
      `Processing ${student.studentName} (${student.number})`,
      "success"
    );
  }
}

function getNextNumber() {
  const waitingStudents = queueData.filter((item) => item.status === "waiting");
  return waitingStudents.length > 0 ? waitingStudents[0].number : "None";
}

function populateMainQueueTable() {
  const tbody = document.getElementById("queueTableBody");
  tbody.innerHTML = "";

  queueData.forEach((item, index) => {
    const row = document.createElement("tr");
    row.className = index % 2 === 0 ? "bg-white" : "bg-gray-50";
    row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="text-lg font-bold text-primary">${
                          item.number
                        }</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">${
                          item.studentName
                        }</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${
                      item.serviceType
                    }</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full priority-${
                          item.priority
                        } text-white">
                            ${
                              item.priority.charAt(0).toUpperCase() +
                              item.priority.slice(1)
                            }
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          item.status
                        )}">
                            ${
                              item.status.charAt(0).toUpperCase() +
                              item.status.slice(1)
                            }
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${
                      item.waitTime
                    }</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onclick="viewQueueDetails(${
                          item.id
                        })" class="text-primary hover:text-primary/80 mr-2">View</button>
                        <button onclick="processStudent(${
                          item.id
                        })" class="text-green-600 hover:text-green-800 mr-2">Process</button>
                        <button onclick="removeFromQueue(${
                          item.id
                        })" class="text-red-600 hover:text-red-800">Remove</button>
                    </td>
                `;
    tbody.appendChild(row);
  });
}

function populateFilteredQueueTable(filteredData) {
  const tbody = document.getElementById("queue-table-body");
  tbody.innerHTML = "";

  filteredData.forEach((student, index) => {
    const row = document.createElement("tr");
    row.className = index % 2 === 0 ? "bg-white" : "bg-gray-50";
    row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="text-lg font-bold text-primary">${
                          student.number
                        }</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">${
                          student.studentName
                        }</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">${
                          student.serviceType
                        }</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full priority-${
                          student.priority
                        } text-white">
                            ${
                              student.priority.charAt(0).toUpperCase() +
                              student.priority.slice(1)
                            }
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          student.status
                        )}">
                            ${
                              student.status.charAt(0).toUpperCase() +
                              student.status.slice(1)
                            }
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">${
                          student.waitTime
                        }</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onclick="viewQueueDetails(${
                          student.id
                        })" class="text-primary hover:text-primary/80 mr-3">View</button>
                        <button onclick="prioritizeStudent(${
                          student.id
                        })" class="text-accent hover:text-accent/80">Prioritize</button>
                        <button onclick="removeFromQueue(${
                          student.id
                        })" class="text-red-600 hover:text-red-800 ml-2">Remove</button>
                    </td>
                `;
    tbody.appendChild(row);
  });
}

function getStatusColor(status) {
  const statusColors = {
    current: "bg-green-100 text-green-800",
    waiting: "bg-blue-100 text-blue-800",
    processing: "bg-yellow-100 text-yellow-800",
    completed: "bg-gray-100 text-gray-800",
  };
  return statusColors[status] || "bg-gray-100 text-gray-800";
}

function switchTab(tabName) {
  // Hide all tab contents
  document.getElementById("queue-content").classList.add("hidden");
  document.getElementById("enrollment-content").classList.add("hidden");
  document.getElementById("reports-content").classList.add("hidden");
  document.getElementById("settings-content").classList.add("hidden");

  // Remove active state from all tabs
  document
    .getElementById("queue-tab")
    .classList.remove("border-primary", "text-primary");
  document
    .getElementById("enrollment-tab")
    .classList.remove("border-primary", "text-primary");
  document
    .getElementById("reports-tab")
    .classList.remove("border-primary", "text-primary");
  document
    .getElementById("settings-tab")
    .classList.remove("border-primary", "text-primary");

  // Show selected tab content and activate tab
  document.getElementById(`${tabName}-content`).classList.remove("hidden");
  document
    .getElementById(`${tabName}-tab`)
    .classList.add("border-primary", "text-primary");
}

function updateQueueStatus() {
  const totalInQueue = queueData.length;
  const waitingCount = queueData.filter(
    (item) => item.status === "waiting"
  ).length;
  const processingCount = queueData.filter(
    (item) => item.status === "processing"
  ).length;
  const priorityCount = queueData.filter(
    (item) => item.priority === "high"
  ).length;

  document.getElementById("total-queue").textContent = totalInQueue;
  document.getElementById("priority-cases").textContent = priorityCount;

  if (currentNumber) {
    document.getElementById("currentNumber").textContent = currentNumber;
  }
  if (nextNumber) {
    document.getElementById("nextNumber").textContent = nextNumber;
  }
}

function startQueueTimer() {
  setInterval(() => {
    queueData.forEach((item) => {
      if (item.status === "waiting") {
        const waitTime = Math.floor((new Date() - item.joinTime) / 60000);
        item.waitTime = `${waitTime} min`;
      }
    });
    populateQueueTable();
  }, 60000); // Update every minute
}

function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `p-4 rounded-lg shadow-lg text-white fade-in ${
    type === "success"
      ? "bg-green-500"
      : type === "warning"
      ? "bg-yellow-500"
      : type === "error"
      ? "bg-red-500"
      : "bg-blue-500"
  }`;
  notification.textContent = message;

  document.getElementById("notificationContainer").appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

function generateCSV(data) {
  const headers = [
    "Queue Number",
    "Student Name",
    "Service Type",
    "Priority",
    "Status",
    "Wait Time",
    "Notes",
    "Timestamp",
  ];
  const csvRows = [headers.join(",")];

  data.forEach((item) => {
    const row = [
      item.number,
      item.studentName,
      item.serviceType,
      item.priority,
      item.status,
      item.waitTime,
      item.notes || "",
      item.timestamp,
    ];
    csvRows.push(row.join(","));
  });

  return csvRows.join("\n");
}

// Refresh functionality
document.getElementById("refresh-btn").addEventListener("click", function () {
  // Simulate refresh
  this.innerHTML =
    '<svg class="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Refreshing...';

  setTimeout(() => {
    this.innerHTML =
      '<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>Refresh';
    populateQueueTable();
    populateEnrollmentTable();
  }, 1000);
});

// Initialize tables
populateQueueTable();
populateEnrollmentTable();

// Initialize queue status
updateQueueStatus();

// Close modals when clicking outside
document
  .getElementById("addQueueModal")
  .addEventListener("click", function (e) {
    if (e.target === this) {
      this.classList.add("hidden");
    }
  });

document
  .getElementById("queueDetailsModal")
  .addEventListener("click", function (e) {
    if (e.target === this) {
      this.classList.add("hidden");
    }
  });

// Missing functions for advanced features
function updateAnalytics() {
  // Update analytics based on selected period
  const period = document.getElementById("analyticsPeriod").value;
  showNotification(`Analytics updated for ${period}`, "info");

  // Update chart data based on period
  if (typeof Chart !== "undefined") {
    // Destroy existing charts and recreate with new data
    Chart.helpers.each(Chart.instances, function (instance) {
      instance.destroy();
    });

    createQueueFlowChart();
    createServiceTypeChart();
    createWaitTimeChart();
    createPriorityChart();
  }
}

function exportAnalyticsData() {
  const period = document.getElementById("analyticsPeriod").value;
  showNotification(`Exporting ${period} analytics data...`, "info");

  // Simulate export process
  setTimeout(() => {
    const csvContent = generateAnalyticsCSV();
    downloadCSV(
      csvContent,
      `queue_analytics_${period}_${new Date().toISOString().split("T")[0]}.csv`
    );
    showNotification("Analytics data exported successfully", "success");
  }, 1500);
}

function generateAnalyticsCSV() {
  const headers = ["Metric", "Value", "Period"];
  const csvRows = [headers.join(",")];

  const metrics = [
    ["Total Students", queueData.length, "Current"],
    ["Average Wait Time", "18 min", "Today"],
    ["Peak Hour", "9:00 AM - 11:00 AM", "Today"],
    ["Queue Efficiency", "85%", "Today"],
  ];

  metrics.forEach((row) => {
    csvRows.push(row.join(","));
  });

  return csvRows.join("\n");
}

function downloadCSV(content, filename) {
  const blob = new Blob([content], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

function toggleNotificationsPanel() {
  const panel = document.getElementById("notificationsPanel");
  panel.classList.toggle("hidden");
}

function addToNotificationsPanel(message, type) {
  const notificationsList = document.getElementById("notificationsList");
  const notificationItem = document.createElement("div");
  notificationItem.className = `p-3 mb-2 rounded-lg ${
    type === "success"
      ? "bg-green-50 border border-green-200"
      : type === "warning"
      ? "bg-yellow-50 border border-yellow-200"
      : type === "error"
      ? "bg-red-50 border border-red-200"
      : "bg-blue-50 border border-blue-200"
  }`;

  notificationItem.innerHTML = `
                <div class="flex items-start">
                    ${getNotificationIcon(type)}
                    <div class="ml-2 flex-1">
                        <p class="text-sm text-gray-800">${message}</p>
                        <p class="text-xs text-gray-500 mt-1">${new Date().toLocaleTimeString()}</p>
                    </div>
                </div>
            `;

  notificationsList.insertBefore(
    notificationItem,
    notificationsList.firstChild
  );

  // Keep only last 20 notifications
  if (notificationsList.children.length > 20) {
    notificationsList.removeChild(notificationsList.lastChild);
  }
}

function getNotificationIcon(type) {
  const icons = {
    success:
      '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>',
    warning:
      '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"></path></svg>',
    error:
      '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>',
    info: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
  };
  return icons[type] || icons.info;
}

// Enhanced notification system
function showAdvancedNotification(message, type = "info", duration = 5000) {
  const notification = document.createElement("div");
  notification.className = `p-4 rounded-lg shadow-lg text-white fade-in slide-in ${
    type === "success"
      ? "bg-green-500"
      : type === "warning"
      ? "bg-yellow-500"
      : type === "error"
      ? "bg-red-500"
      : "bg-blue-500"
  }`;

  const icon = getNotificationIcon(type);
  notification.innerHTML = `
                <div class="flex items-center">
                    ${icon}
                    <span class="ml-2">${message}</span>
                </div>
            `;

  document.getElementById("notificationContainer").appendChild(notification);

  // Add to notifications panel
  addToNotificationsPanel(message, type);

  setTimeout(() => {
    notification.remove();
  }, duration);
}
