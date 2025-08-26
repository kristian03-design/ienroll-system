// Sample enrollment data
let enrollmentData = [
  {
    id: "ST001",
    name: "John Doe",
    email: "john.doe@email.com",
    phone: "+1-555-0123",
    program: "Computer Science",
    status: "pending",
    date: "2024-01-15",
    notes: "Documents pending verification",
    documents: [
      {
        name: "High School Diploma",
        status: "submitted",
        file: "diploma_st001.pdf",
      },
      { name: "Transcript", status: "submitted", file: "transcript_st001.pdf" },
      {
        name: "Birth Certificate",
        status: "submitted",
        file: "birth_cert_st001.pdf",
      },
      { name: "Medical Certificate", status: "pending", file: null },
    ],
  },
  {
    id: "ST002",
    name: "Jane Smith",
    email: "jane.smith@email.com",
    phone: "+1-555-0124",
    program: "Engineering",
    status: "verified",
    date: "2024-01-14",
    notes: "All requirements met",
    documents: [
      {
        name: "High School Diploma",
        status: "verified",
        file: "diploma_st002.pdf",
      },
      { name: "Transcript", status: "verified", file: "transcript_st002.pdf" },
      {
        name: "Birth Certificate",
        status: "verified",
        file: "birth_cert_st002.pdf",
      },
      {
        name: "Medical Certificate",
        status: "verified",
        file: "medical_cert_st002.pdf",
      },
    ],
  },
  {
    id: "ST003",
    name: "Jane Smith",
    email: "jane.smith@email.com",
    phone: "+1-555-0125",
    program: "Business",
    status: "verified",
    date: "2024-01-13",
    notes: "Ready for enrollment",
    documents: [
      {
        name: "High School Diploma",
        status: "verified",
        file: "diploma_st003.pdf",
      },
      { name: "Transcript", status: "verified", file: "transcript_st003.pdf" },
      {
        name: "Birth Certificate",
        status: "verified",
        file: "birth_cert_st003.pdf",
      },
      {
        name: "Medical Certificate",
        status: "verified",
        file: "medical_cert_st003.pdf",
      },
    ],
  },
  {
    id: "ST004",
    name: "Carlos Rodriguez",
    email: "carlos.rodriguez@email.com",
    phone: "+1-555-0126",
    program: "Computer Science",
    status: "rejected",
    date: "2024-01-12",
    notes: "Incomplete documentation",
    documents: [
      {
        name: "High School Diploma",
        status: "submitted",
        file: "diploma_st004.pdf",
      },
      { name: "Transcript", status: "missing", file: null },
      {
        name: "Birth Certificate",
        status: "submitted",
        file: "birth_cert_st004.pdf",
      },
      { name: "Medical Certificate", status: "missing", file: null },
    ],
  },
  {
    id: "ST005",
    name: "Lisa Chen",
    email: "lisa.chen@email.com",
    phone: "+1-555-0127",
    program: "Engineering",
    status: "pending",
    date: "2024-01-11",
    notes: "Awaiting transcript",
    documents: [
      {
        name: "High School Diploma",
        status: "submitted",
        file: "diploma_st005.pdf",
      },
      { name: "Transcript", status: "pending", file: null },
      {
        name: "Birth Certificate",
        status: "submitted",
        file: "birth_cert_st005.pdf",
      },
      {
        name: "Medical Certificate",
        status: "submitted",
        file: "medical_cert_st005.pdf",
      },
    ],
  },
];

let currentEditId = null;

// Initialize the page
document.addEventListener("DOMContentLoaded", function () {
  populateEnrollmentTable();
  setupEventListeners();
});

function setupEventListeners() {
  // Search functionality
  document
    .getElementById("searchInput")
    .addEventListener("input", filterEnrollments);
  document
    .getElementById("statusFilter")
    .addEventListener("change", filterEnrollments);
  document
    .getElementById("programFilter")
    .addEventListener("change", filterEnrollments);

  // Export functionality
  document
    .getElementById("exportBtn")
    .addEventListener("click", exportEnrollmentData);

  // Form submission
  document
    .getElementById("enrollmentForm")
    .addEventListener("submit", handleEnrollmentSubmit);

  // Add enrollment button
  document
    .getElementById("add-enrollment-btn")
    .addEventListener("click", openAddEnrollmentModal);
}

function populateEnrollmentTable() {
  const tbody = document.getElementById("enrollmentTableBody");
  tbody.innerHTML = "";

  enrollmentData.forEach((enrollment, index) => {
    const row = document.createElement("tr");
    row.className = "bg-white hover:bg-gray-50 transition-colors duration-150";

    const statusColors = {
      pending: "bg-yellow-100 text-yellow-700",
      approved: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
      verified: "bg-blue-100 text-blue-700",
    };

    row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${
                      enrollment.id
                    }</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${
                      enrollment.name
                    }</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${
                      enrollment.program
                    }</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          statusColors[enrollment.status]
                        }">
                            ${
                              enrollment.status.charAt(0).toUpperCase() +
                              enrollment.status.slice(1)
                            }
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${
                      enrollment.date
                    }</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onclick="viewEnrollmentDetails('${
                          enrollment.id
                        }')" class="text-blue-600 hover:text-blue-800 mr-3">View</button>
                        <button onclick="changeStatus('${
                          enrollment.id
                        }', 'approved')" class="text-green-600 hover:text-green-800 mr-3">Approve</button>
                        <button onclick="changeStatus('${
                          enrollment.id
                        }', 'rejected')" class="text-red-600 hover:text-red-800">Reject</button>
                    </td>
                `;
    tbody.appendChild(row);
  });
}

function filterEnrollments() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const statusFilter = document.getElementById("statusFilter").value;
  const programFilter = document.getElementById("programFilter").value;

  const filteredData = enrollmentData.filter((enrollment) => {
    const matchesSearch =
      enrollment.name.toLowerCase().includes(searchTerm) ||
      enrollment.id.toLowerCase().includes(searchTerm) ||
      enrollment.program.toLowerCase().includes(searchTerm);
    const matchesStatus = !statusFilter || enrollment.status === statusFilter;
    const matchesProgram =
      !programFilter || enrollment.program === programFilter;

    return matchesSearch && matchesStatus && matchesProgram;
  });

  displayFilteredEnrollments(filteredData);
}

function displayFilteredEnrollments(filteredData) {
  const tbody = document.getElementById("enrollmentTableBody");
  tbody.innerHTML = "";

  filteredData.forEach((enrollment, index) => {
    const row = document.createElement("tr");
    row.className = "bg-white hover:bg-gray-50 transition-colors duration-150";

    const statusColors = {
      pending: "bg-yellow-100 text-yellow-700",
      approved: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
      verified: "bg-blue-100 text-blue-700",
    };

    row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${
                      enrollment.id
                    }</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${
                      enrollment.name
                    }</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${
                      enrollment.program
                    }</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          statusColors[enrollment.status]
                        }">
                            ${
                              enrollment.status.charAt(0).toUpperCase() +
                              enrollment.status.slice(1)
                            }
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${
                      enrollment.date
                    }</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onclick="viewEnrollmentDetails('${
                          enrollment.id
                        }')" class="text-blue-600 hover:text-blue-800 mr-3">View</button>
                        <button onclick="changeStatus('${
                          enrollment.id
                        }', 'approved')" class="text-green-600 hover:text-green-800 mr-3">Approve</button>
                        <button onclick="changeStatus('${
                          enrollment.id
                        }', 'rejected')" class="text-red-600 hover:text-red-800">Reject</button>
                    </td>
                `;
    tbody.appendChild(row);
  });
}

function openAddEnrollmentModal() {
  currentEditId = null;
  document.getElementById("modalTitle").textContent = "Add New Enrollment";
  document.getElementById("enrollmentForm").reset();
  document.getElementById("enrollmentModal").classList.remove("hidden");
}

function editEnrollment(id) {
  const enrollment = enrollmentData.find((e) => e.id === id);
  if (enrollment) {
    currentEditId = id;
    document.getElementById("modalTitle").textContent = "Edit Enrollment";

    // Populate form fields
    const form = document.getElementById("enrollmentForm");
    form.elements["studentId"].value = enrollment.id;
    form.elements["fullName"].value = enrollment.name;
    form.elements["email"].value = enrollment.email;
    form.elements["phone"].value = enrollment.phone;
    form.elements["program"].value = enrollment.program;
    form.elements["status"].value = enrollment.status;
    form.elements["notes"].value = enrollment.notes;

    // Populate document fields
    if (enrollment.documents) {
      enrollment.documents.forEach((doc) => {
        const docName = doc.name.toLowerCase().replace(/\s+/g, "_");
        const statusField = form.elements[`${docName}_status`];
        const checkboxField = form.elements[`doc_${docName}`];

        if (statusField) {
          statusField.value = doc.status;
        }
        if (checkboxField && doc.file) {
          checkboxField.checked = true;
        }
      });
    }

    document.getElementById("enrollmentModal").classList.remove("hidden");
  }
}

function handleEnrollmentSubmit(e) {
  e.preventDefault();

  const formData = new FormData(e.target);

  // Handle documents data
  const documents = [
    {
      name: "High School Diploma",
      status: formData.get("diploma_status") || "missing",
      file: formData.get("doc_diploma")
        ? `diploma_${formData.get("studentId")}.pdf`
        : null,
    },
    {
      name: "Transcript",
      status: formData.get("transcript_status") || "missing",
      file: formData.get("doc_transcript")
        ? `transcript_${formData.get("studentId")}.pdf`
        : null,
    },
    {
      name: "Birth Certificate",
      status: formData.get("birth_cert_status") || "missing",
      file: formData.get("doc_birth_cert")
        ? `birth_cert_${formData.get("studentId")}.pdf`
        : null,
    },
    {
      name: "Medical Certificate",
      status: formData.get("medical_status") || "missing",
      file: formData.get("doc_medical")
        ? `medical_cert_${formData.get("studentId")}.pdf`
        : null,
    },
  ];

  const enrollment = {
    id: formData.get("studentId"),
    name: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    program: formData.get("program"),
    status: formData.get("status"),
    date: new Date().toISOString().split("T")[0],
    notes: formData.get("notes"),
    documents: documents,
  };

  if (currentEditId) {
    // Update existing enrollment
    const index = enrollmentData.findIndex((e) => e.id === currentEditId);
    if (index !== -1) {
      enrollmentData[index] = { ...enrollmentData[index], ...enrollment };
    }
  } else {
    // Add new enrollment
    enrollmentData.push(enrollment);
  }

  populateEnrollmentTable();
  closeEnrollmentModal();
  updateStatistics();
}

function viewEnrollmentDetails(id) {
  const enrollment = enrollmentData.find((e) => e.id === id);
  if (enrollment) {
    const content = document.getElementById("detailsModalContent");

    // Generate documents HTML with file icons and view links
    const documentsHtml = enrollment.documents
      ? enrollment.documents
          .map((doc) => {
            return `
                        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div class="flex items-center space-x-3">
                                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                                <span class="text-sm font-medium text-gray-900">${
                                  doc.name
                                }</span>
                            </div>
                            <div class="flex items-center space-x-2">
                                ${
                                  doc.file
                                    ? `
                                    <button onclick="viewDocument('${doc.file}')" class="text-primary hover:text-primary/80 text-sm font-medium">
                                        View
                                    </button>
                                `
                                    : `
                                    <span class="text-gray-400 text-sm">No file</span>
                                `
                                }
                            </div>
                        </div>
                    `;
          })
          .join("")
      : '<p class="text-gray-500 text-sm">No documents available</p>';

    content.innerHTML = `
                    <div class="space-y-6">
                        <!-- Student Information Section -->
                        <div class="bg-gray-50 rounded-lg p-4">
                            <h4 class="text-lg font-semibold text-gray-900 mb-4">Student Information</h4>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Student ID</label>
                                    <p class="mt-1 text-sm text-gray-900 font-mono">${enrollment.id}</p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Full Name</label>
                                    <p class="mt-1 text-sm text-gray-900">${enrollment.name}</p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Email</label>
                                    <p class="mt-1 text-sm text-gray-900">${enrollment.email}</p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Program</label>
                                    <p class="mt-1 text-sm text-gray-900">${enrollment.program}</p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Documents Section -->
                        <div class="bg-gray-50 rounded-lg p-4">
                            <h4 class="text-lg font-semibold text-gray-900 mb-4">Documents</h4>
                            <div class="space-y-3">
                                ${documentsHtml}
                            </div>
                        </div>
                        
                        <!-- Actions Section -->
                        <div class="mt-6 pt-6 border-t border-gray-200">
                        <h4 class="text-lg font-semibold text-gray-900 mb-4">Actions</h4>
                        <div class="flex space-x-3">
                                <button onclick="changeStatus('${enrollment.id}', 'approved')" class="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium">
                                    Approve Application
                                </button>
                                <button onclick="changeStatus('${enrollment.id}', 'rejected')" class="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium">
                                    Reject Application
                                </button>
                                <button onclick="changeStatus('${enrollment.id}', 'pending')" class="w-full bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors font-medium">
                                    Request Changes
                                </button>
                            </div>
                        </div>
                    </div>
                `;

    document.getElementById("detailsModal").classList.remove("hidden");
  }
}

function changeStatus(id, newStatus) {
  const enrollment = enrollmentData.find((e) => e.id === id);
  if (enrollment) {
    enrollment.status = newStatus;
    populateEnrollmentTable();
    updateStatistics();
    closeDetailsModal();
  }
}

function deleteEnrollment(id) {
  if (confirm("Are you sure you want to delete this enrollment?")) {
    enrollmentData = enrollmentData.filter((e) => e.id !== id);
    populateEnrollmentTable();
    updateStatistics();
  }
}

function updateStatistics() {
  const total = enrollmentData.length;
  const pending = enrollmentData.filter((e) => e.status === "pending").length;
  const approved = enrollmentData.filter((e) => e.status === "approved").length;
  const rejected = enrollmentData.filter((e) => e.status === "rejected").length;

  document.getElementById("total-enrolled").textContent = total;
  document.getElementById("pending-review").textContent = pending;
  document.getElementById("approved-today").textContent = approved;
  document.getElementById("rejected-today").textContent = rejected;
}

function exportEnrollmentData() {
  const csvContent =
    "data:text/csv;charset=utf-8," +
    "Student ID,Name,Email,Phone,Program,Status,Date,Notes\n" +
    enrollmentData
      .map(
        (e) =>
          `${e.id},${e.name},${e.email},${e.phone},${e.program},${e.status},${e.date},${e.notes}`
      )
      .join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "enrollment_data.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function closeEnrollmentModal() {
  document.getElementById("enrollmentModal").classList.add("hidden");
  currentEditId = null;
}

function closeDetailsModal() {
  document.getElementById("detailsModal").classList.add("hidden");
}

// Document management functions
function downloadDocument(filename) {
  // In a real application, this would trigger a file download
  alert(`Downloading ${filename}`);
}

function viewDocument(filename) {
  // In a real application, this would open a document viewer
  alert(`Opening ${filename} for viewing`);
}

function verifyDocuments(studentId) {
  const enrollment = enrollmentData.find((e) => e.id === studentId);
  if (enrollment && enrollment.documents) {
    // Mark all submitted documents as verified
    enrollment.documents.forEach((doc) => {
      if (doc.status === "submitted") {
        doc.status = "verified";
      }
    });

    // Update the display
    viewEnrollmentDetails(studentId);

    // Show success message
    alert("Documents have been marked as verified!");
  }
}

// Close modals when clicking outside
document
  .getElementById("enrollmentModal")
  .addEventListener("click", function (e) {
    if (e.target === this) {
      this.classList.add("hidden");
    }
  });

document.getElementById("detailsModal").addEventListener("click", function (e) {
  if (e.target === this) {
    this.classList.add("hidden");
  }
});
