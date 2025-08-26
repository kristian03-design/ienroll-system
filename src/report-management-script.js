document.addEventListener("DOMContentLoaded", function () {
  // Enrollment Trends - Column Chart
  var enrollmentOptions = {
    chart: {
      type: "bar",
      height: 180,
      toolbar: { show: false },
    },
    series: [
      {
        name: "Enrollments",
        data: [65, 59, 80, 81, 56, 55],
      },
    ],
    xaxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    colors: ["#00BFFF"],
    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: "40%",
        distributed: false,
      },
    },
    grid: { borderColor: "#e5e7eb" },
    dataLabels: { enabled: false },
    legend: { show: false },
    yaxis: {
      min: 0,
    },
  };
  var enrollmentChart = new ApexCharts(
    document.querySelector("#enrollmentApexChart"),
    enrollmentOptions
  );
  enrollmentChart.render();

  // Queue Distribution - Donut Chart
  var queueOptions = {
    chart: {
      type: "donut",
      height: 180,
      toolbar: { show: false },
    },
    series: [44, 32, 24],
    labels: ["Regular", "Priority", "Express"],
    colors: ["#00BFFF", "#f97316", "#0d9488"],
    legend: { show: true, position: "bottom" },
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
        },
      },
    },
  };
  var queueChart = new ApexCharts(
    document.querySelector("#queueApexChart"),
    queueOptions
  );
  queueChart.render();
});
// Sample data for demonstration
let currentReportData = [];
let currentPage = 1;
const itemsPerPage = 10;

// Initialize charts
document.addEventListener("DOMContentLoaded", function () {
  initializeCharts();
  generateSampleData();
});

function initializeCharts() {
  // Enrollment Trends Chart
  const enrollmentCtx = document
    .getElementById("enrollmentChart")
    .getContext("2d");
  new Chart(enrollmentCtx, {
    type: "line",
    data: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      datasets: [
        {
          label: "Enrollments",
          data: [65, 59, 80, 81, 56, 55],
          borderColor: "#00BFFF",
          backgroundColor: "rgba(0, 191, 255, 0.1)",
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });

  // Queue Distribution Chart
  const queueCtx = document.getElementById("queueChart").getContext("2d");
  new Chart(queueCtx, {
    type: "doughnut",
    data: {
      labels: ["Regular", "Priority", "Express"],
      datasets: [
        {
          data: [65, 25, 10],
          backgroundColor: ["#00BFFF", "#0d9488", "#f97316"],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
        },
      },
    },
  });
}

function generateSampleData() {
  currentReportData = [
    {
      id: "2024-001",
      name: "John Doe",
      program: "Computer Science",
      status: "Approved",
      date: "2024-01-15",
    },
    {
      id: "2024-002",
      name: "Jane Smith",
      program: "Engineering",
      status: "Pending",
      date: "2024-01-14",
    },
    {
      id: "2024-003",
      name: "Mike Johnson",
      program: "Business",
      status: "Approved",
      date: "2024-01-13",
    },
    {
      id: "2024-004",
      name: "Sarah Wilson",
      program: "Arts & Sciences",
      status: "Rejected",
      date: "2024-01-12",
    },
    {
      id: "2024-005",
      name: "David Brown",
      program: "Computer Science",
      status: "Pending",
      date: "2024-01-11",
    },
    {
      id: "2024-006",
      name: "Lisa Davis",
      program: "Engineering",
      status: "Approved",
      date: "2024-01-10",
    },
    {
      id: "2024-007",
      name: "Tom Miller",
      program: "Business",
      status: "Approved",
      date: "2024-01-09",
    },
    {
      id: "2024-008",
      name: "Amy Garcia",
      program: "Computer Science",
      status: "Pending",
      date: "2024-01-08",
    },
    {
      id: "2024-009",
      name: "Chris Lee",
      program: "Arts & Sciences",
      status: "Approved",
      date: "2024-01-07",
    },
    {
      id: "2024-010",
      name: "Emma Taylor",
      program: "Engineering",
      status: "Rejected",
      date: "2024-01-06",
    },
  ];
  displayTable();
  updatePagination();
}

function generateReport(type) {
  // Show loading state
  const button = event.target;
  const originalText = button.textContent;
  button.textContent = "Generating...";
  button.disabled = true;

  // Simulate report generation
  setTimeout(() => {
    button.textContent = originalText;
    button.disabled = false;

    // Update stats based on report type
    if (type === "enrollment") {
      updateStats("enrollment");
    } else if (type === "queue") {
      updateStats("queue");
    } else if (type === "verification") {
      updateStats("verification");
    }

    // Show success message
    showNotification(`Report generated successfully!`, "success");
  }, 2000);
}

function updateStats(type) {
  // Update quick stats based on report type
  const stats = {
    enrollment: { total: 1247, processing: 18, approved: 892, pending: 355 },
    queue: { total: 1247, processing: 22, approved: 892, pending: 355 },
    verification: { total: 1247, processing: 15, approved: 892, pending: 355 },
  };

  const data = stats[type];
  document.querySelector(".text-2xl.font-semibold.text-gray-900").textContent =
    data.total;
  document.querySelectorAll(
    ".text-2xl.font-semibold.text-gray-900"
  )[1].textContent = data.processing + " min";
}

function displayGrid() {
  const gridBody = document.getElementById("reportGridBody");
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageData = currentReportData.slice(start, end);

  gridBody.innerHTML = pageData
    .map(
      (item) => `
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div class="flex items-start justify-between mb-4">
                        <div class="flex-1">
                            <h3 class="text-lg font-semibold text-gray-900 mb-1">${
                              item.name
                            }</h3>
                            <p class="text-sm text-gray-500 mb-2">ID: ${
                              item.id
                            }</p>
                            <p class="text-sm text-gray-600 mb-3">${
                              item.program
                            }</p>
                        </div>
                        <span class="px-3 py-1 text-xs font-semibold rounded-full ${
                          item.status === "Approved"
                            ? "bg-green-100 text-green-800"
                            : item.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }">
                            ${item.status}
                        </span>
                    </div>
                    
                    <div class="border-t border-gray-100 pt-4">
                        <p class="text-sm text-gray-500 mb-4">Submitted: ${
                          item.date
                        }</p>
                        <div class="flex space-x-2">
                            <button class="flex-1 bg-sky-blue text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium">
                                View Details
                            </button>
                            <button class="text-teal hover:text-teal-600 transition-colors text-sm font-medium px-3 py-2 rounded-lg border border-teal">
                                Export
                            </button>
                        </div>
                    </div>
                </div>
            `
    )
    .join("");
}

function updatePagination() {
  const totalPages = Math.ceil(currentReportData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(
    currentPage * itemsPerPage,
    currentReportData.length
  );

  document.getElementById("startIndex").textContent = startIndex;
  document.getElementById("endIndex").textContent = endIndex;
  document.getElementById("totalResults").textContent =
    currentReportData.length;

  const pageNumbers = document.getElementById("pageNumbers");
  pageNumbers.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const button = document.createElement("button");
    button.textContent = i;
    button.className = `px-3 py-2 text-sm font-medium ${
      i === currentPage
        ? "text-white bg-sky-blue border border-sky-blue"
        : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
    } rounded-lg`;
    button.onclick = () => goToPage(i);
    pageNumbers.appendChild(button);
  }
}

function goToPage(page) {
  currentPage = page;
  displayTable();
  updatePagination();
}

function previousPage() {
  if (currentPage > 1) {
    goToPage(currentPage - 1);
  }
}

function nextPage() {
  const totalPages = Math.ceil(currentReportData.length / itemsPerPage);
  if (currentPage < totalPages) {
    goToPage(currentPage + 1);
  }
}

function exportReport(format) {
  showNotification(`Exporting to ${format.toUpperCase()}...`, "info");

  // Simulate export process
  setTimeout(() => {
    showNotification(
      `Report exported to ${format.toUpperCase()} successfully!`,
      "success"
    );
  }, 1500);
}

function showNotification(message, type) {
  // Create notification element
  const notification = document.createElement("div");
  notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg text-white font-medium z-50 ${
    type === "success"
      ? "bg-green-500"
      : type === "error"
      ? "bg-red-500"
      : "bg-sky-blue"
  }`;
  notification.textContent = message;

  document.body.appendChild(notification);

  // Remove notification after 3 seconds
  setTimeout(() => {
    notification.remove();
  }, 3000);
}
