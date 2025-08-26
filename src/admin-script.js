// Mobile menu toggle
document
  .getElementById("mobile-menu-btn")
  .addEventListener("click", function () {
    document.getElementById("mobileMenu").classList.toggle("hidden");
  });

// Close mobile menu when clicking outside
document.getElementById("mobileMenu").addEventListener("click", function (e) {
  if (e.target === this) {
    this.classList.add("hidden");
  }
});

// Enrollment modal functions
function openEnrollmentModal(studentId) {
  document.getElementById("enrollmentModal").classList.remove("hidden");
  // You can populate modal with student data here
}

function closeEnrollmentModal() {
  document.getElementById("enrollmentModal").classList.add("hidden");
}

// Close modal when clicking outside
document
  .getElementById("enrollmentModal")
  .addEventListener("click", function (e) {
    if (e.target === this) {
      this.classList.add("hidden");
    }
  });

// Smooth scrolling for navigation
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

// Live search filtering for students table and queue list
const globalSearchInput = document.getElementById("globalSearchInput");
globalSearchInput?.addEventListener("input", function () {
  const query = this.value.trim().toLowerCase();

  // Filter students table rows
  const studentRows = document.querySelectorAll("#studentsTableBody tr");
  studentRows.forEach((row) => {
    const text = row.textContent?.toLowerCase() || "";
    row.classList.toggle("hidden", query && !text.includes(query));
  });

  // Filter queue items by name
  const queueItems = document.querySelectorAll("#queueList .queue-item");
  queueItems.forEach((item) => {
    const name =
      item.querySelector(".queue-name")?.textContent?.toLowerCase() || "";
    item.classList.toggle("hidden", query && !name.includes(query));
  });
});

// Export Data to CSV (students table)
document
  .getElementById("exportDataBtn")
  ?.addEventListener("click", function () {
    const rows = Array.from(document.querySelectorAll("#studentsTableBody tr"))
      .filter((r) => !r.classList.contains("hidden"))
      .map((row) =>
        Array.from(row.querySelectorAll("td"))
          .slice(0, 5)
          .map((td) => td.textContent?.trim() || "")
      );

    const header = [
      "Student ID",
      "Name",
      "Program",
      "Status",
      "Submission Date",
    ];
    const csv = [header, ...rows]
      .map((cols) =>
        cols.map((v) => '"' + v.replace(/"/g, '""') + '"').join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "enrollments.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });

// Refresh Queue with spinner + simulated delay and stat updates
document
  .getElementById("refreshQueueBtn")
  ?.addEventListener("click", async function () {
    const btn = this;
    const originalHtml = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML =
      '<svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Refreshing...';

    // Simulate fetching new queue items
    await new Promise((r) => setTimeout(r, 1200));

    // Example: update average wait time and priority cases randomly
    const avgWait = (Math.random() * 2 + 1).toFixed(1); // 1.0 - 3.0 hours
    const priorityCases = Math.floor(Math.random() * 10) + 5; // 5 - 14
    const graduating = Math.floor(Math.random() * 10) + 1; // 1 - 10

    document
      .getElementById("avgWaitTimeStat")
      ?.replaceChildren(document.createTextNode(`${avgWait} hours`));
    document
      .getElementById("priorityCasesStat")
      ?.replaceChildren(document.createTextNode(String(priorityCases)));
    document
      .getElementById("graduatingStudentsStat")
      ?.replaceChildren(document.createTextNode(String(graduating)));

    // Also update the header queue length card if present
    const queueLengthEl = document.getElementById("queueLengthCount");
    if (queueLengthEl) {
      const visibleQueueItems = document.querySelectorAll(
        "#queueList .queue-item:not(.hidden)"
      );
      queueLengthEl.textContent = String(visibleQueueItems.length);
    }

    btn.disabled = false;
    btn.innerHTML = originalHtml;
  });

// Students table Approve/Reject/View actions
document
  .getElementById("studentsTableBody")
  ?.addEventListener("click", function (e) {
    const target = e.target;
    if (!(target instanceof Element)) return;
    const row = target.closest("tr");
    if (!row) return;
    const statusBadge = row.querySelector(".status-badge");

    const action = target.getAttribute("data-action");
    if (action === "view") {
      const id = row.getAttribute("data-student-id") || "";
      openEnrollmentModal(id);
      return;
    }

    if (action === "approve" && statusBadge) {
      statusBadge.textContent = "Approved";
      statusBadge.setAttribute("data-status", "Approved");
      statusBadge.className =
        "status-badge inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800";

      // stats: increment approved today, decrement pending if was pending/verified
      const approvedEl = document.getElementById("approvedTodayCount");
      if (approvedEl)
        approvedEl.textContent = String(
          (parseInt(approvedEl.textContent || "0", 10) || 0) + 1
        );

      const prev = (
        statusBadge.getAttribute("data-prev") ||
        statusBadge.getAttribute("data-status") ||
        ""
      ).toLowerCase();
      const pendingEl = document.getElementById("pendingReviewsCount");
      if (pendingEl && (prev === "pending" || prev === "verified")) {
        pendingEl.textContent = String(
          Math.max(0, (parseInt(pendingEl.textContent || "0", 10) || 0) - 1)
        );
      }
      statusBadge.setAttribute("data-prev", "Approved");
    }

    if (action === "reject" && statusBadge) {
      statusBadge.textContent = "Rejected";
      statusBadge.setAttribute("data-status", "Rejected");
      statusBadge.className =
        "status-badge inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800";

      const prev = (
        statusBadge.getAttribute("data-prev") ||
        statusBadge.getAttribute("data-status") ||
        ""
      ).toLowerCase();
      const pendingEl = document.getElementById("pendingReviewsCount");
      if (pendingEl && (prev === "pending" || prev === "verified")) {
        pendingEl.textContent = String(
          Math.max(0, (parseInt(pendingEl.textContent || "0", 10) || 0) - 1)
        );
      }
      statusBadge.setAttribute("data-prev", "Rejected");
    }
  });

// Queue item Prioritize/Remove actions and stats recalc
document.getElementById("queueList")?.addEventListener("click", function (e) {
  const target = e.target;
  if (!(target instanceof Element)) return;
  const item = target.closest(".queue-item");
  if (!item) return;

  if (target.classList.contains("btn-remove")) {
    item.remove();
    recomputeQueueStats();
    return;
  }

  if (target.classList.contains("btn-prioritize")) {
    // Move item to top visually
    const list = document.getElementById("queueList");
    if (!list) return;
    list.prepend(item);
    item.setAttribute("data-priority", "true");
    recomputeQueueStats();
  }
});

function recomputeQueueStats() {
  const items = Array.from(document.querySelectorAll("#queueList .queue-item"));
  const visibleItems = items.filter((i) => !i.classList.contains("hidden"));

  // Queue length (header card)
  const queueLengthEl = document.getElementById("queueLengthCount");
  if (queueLengthEl) queueLengthEl.textContent = String(visibleItems.length);

  // Average wait time (Queue Statistics widget)
  const mins = visibleItems.map(
    (i) => parseInt(i.getAttribute("data-wait-mins") || "0", 10) || 0
  );
  const avg = mins.length ? mins.reduce((a, b) => a + b, 0) / mins.length : 0;
  const avgHours = (avg / 60).toFixed(1);
  const avgWaitEl = document.getElementById("avgWaitTimeStat");
  if (avgWaitEl) avgWaitEl.textContent = avgHours + " hours";

  // Priority cases
  const priorityCount = visibleItems.filter(
    (i) => i.getAttribute("data-priority") === "true"
  ).length;
  const priorityEl = document.getElementById("priorityCasesStat");
  if (priorityEl) priorityEl.textContent = String(priorityCount);

  // Graduating students
  const gradCount = visibleItems.filter(
    (i) => i.getAttribute("data-graduating") === "true"
  ).length;
  const gradEl = document.getElementById("graduatingStudentsStat");
  if (gradEl) gradEl.textContent = String(gradCount);
}
// Logout button handler
document
  .getElementById("logoutButton")
  ?.addEventListener("click", function (e) {
    e.preventDefault();
    const confirmed = window.confirm("Are you sure you want to log out?");
    if (!confirmed) return;
    // Clear any simple auth-related localStorage keys used in this demo
    localStorage.removeItem("accountLocked");
    localStorage.removeItem("rememberMe");
    // Keep rememberedEmail only if rememberMe remained true; since we removed rememberMe, also clear email
    localStorage.removeItem("rememberedEmail");
    // Redirect to login
    window.location.href = "admin-login.html";
  });

// Add fade-in animation to cards
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("fade-in");
    }
  });
}, observerOptions);

document.querySelectorAll(".bg-white").forEach((card) => {
  observer.observe(card);
});
