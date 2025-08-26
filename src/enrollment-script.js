// Enrollment System JavaScript

class EnrollmentSystem {
  constructor() {
    this.queueNumber = null;
    this.queuePosition = null;
    this.waitTime = null;
    this.autoSaveTimer = null;
    this.formData = {};

    this.initializeEventListeners();
    this.loadSavedDraft();
  }

  initializeEventListeners() {
    // Form elements
    const form = document.getElementById("enrollmentForm");
    const saveDraftBtn = document.getElementById("saveDraft");
    const draftStatus = document.getElementById("draftStatus");

    // Form input listeners
    form.addEventListener("input", (e) => this.handleFormInput(e));
    form.addEventListener("submit", (e) => this.handleFormSubmit(e));
    saveDraftBtn.addEventListener("click", () => this.saveDraft());

    // Modal close handlers
    document
      .getElementById("closeSuccessModal")
      ?.addEventListener("click", () => this.closeModal("successModal"));
    document
      .getElementById("closeDuplicateModal")
      ?.addEventListener("click", () => this.closeModal("duplicateModal"));

    // Priority checkbox listeners
    const priorityCheckboxes = document.querySelectorAll(
      'input[name="priority"]'
    );
    priorityCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", () => this.handlePriorityChange());
    });

    // Initialize queue updates
    this.startQueueUpdates();
  }

  handleFormInput(e) {
    // Clear existing timer
    clearTimeout(this.autoSaveTimer);

    // Update draft status
    this.updateDraftStatus("Saving...", "yellow");

    // Set new timer for auto-save
    this.autoSaveTimer = setTimeout(() => {
      this.autoSaveDraft();
    }, 1000);

    // Store form data
    this.formData[e.target.name] = e.target.value;
  }

  handleFormSubmit(e) {
    e.preventDefault();

    if (!this.validateForm()) {
      this.showValidationErrors();
      return;
    }

    // Check for duplicate entry
    if (this.checkForDuplicate()) {
      this.showDuplicateModal();
      return;
    }

    // For multi-step form, navigate to step 2 instead of submitting
    this.goToStep2();
  }

  // New function for multi-step navigation
  goToStep2() {
    // Validate form first
    if (!this.validateForm()) {
      this.showValidationErrors();
      return;
    }

    // Save current form data as draft
    this.saveDraft();

    // Navigate to step 2
    window.location.href = "enrollment-step2.html";
  }

  validateForm() {
    const requiredFields = document.querySelectorAll("[required]");
    let isValid = true;

    requiredFields.forEach((field) => {
      if (!field.value.trim()) {
        isValid = false;
        field.classList.add("border-red-500");
        this.showFieldError(field, "This field is required");
      } else {
        field.classList.remove("border-red-500");
        this.clearFieldError(field);
      }
    });

    // Email validation
    const emailField = document.getElementById("email");
    if (emailField.value && !this.isValidEmail(emailField.value)) {
      isValid = false;
      emailField.classList.add("border-red-500");
      this.showFieldError(emailField, "Please enter a valid email address");
    }

    return isValid;
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  showFieldError(field, message) {
    // Remove existing error
    this.clearFieldError(field);

    // Add error message
    const errorDiv = document.createElement("div");
    errorDiv.className = "text-red-500 text-sm mt-1";
    errorDiv.textContent = message;
    errorDiv.id = `${field.id}-error`;

    field.parentNode.appendChild(errorDiv);
  }

  clearFieldError(field) {
    const existingError = document.getElementById(`${field.id}-error`);
    if (existingError) {
      existingError.remove();
    }
  }

  showValidationErrors() {
    // Show toast notification
    this.showToast("Please fill in all required fields", "error");
  }

  checkForDuplicate() {
    // Simulate duplicate check - in real implementation, this would check against database
    const email = document.getElementById("email").value;
    const studentId = document.getElementById("studentId").value;

    // Mock duplicate check
    return email === "existing@example.com" || studentId === "STU123456";
  }

  submitEnrollment() {
    // Show loading state
    this.showLoadingState();

    // Simulate API call
    setTimeout(() => {
      // Generate queue data
      this.generateQueueData();

      // Update UI
      this.updateQueueDisplay();

      // Show success modal
      this.showSuccessModal();

      // Hide loading state
      this.hideLoadingState();
    }, 2000);
  }

  generateQueueData() {
    this.queueNumber = Math.floor(Math.random() * 1000) + 1;
    this.queuePosition = Math.floor(Math.random() * 50) + 1;
    this.waitTime = Math.floor(Math.random() * 30) + 5;
  }

  updateQueueDisplay() {
    // Update queue number
    const queueNumberElement = document.getElementById("queueNumber");
    if (queueNumberElement) {
      queueNumberElement.textContent = this.queueNumber;
      queueNumberElement.classList.add("fade-in-up");
    }

    // Update queue position
    const queuePositionElement = document.getElementById("queuePosition");
    if (queuePositionElement) {
      queuePositionElement.textContent = this.queuePosition;
    }

    // Update wait time
    const waitTimeElement = document.getElementById("waitTime");
    if (waitTimeElement) {
      waitTimeElement.textContent = `${this.waitTime} min`;
    }

    // Show priority badge if applicable
    this.handlePriorityChange();
  }

  handlePriorityChange() {
    const priorityCheckboxes = document.querySelectorAll(
      'input[name="priority"]:checked'
    );
    const priorityBadge = document.getElementById("priorityBadge");

    if (priorityCheckboxes.length > 0 && priorityBadge) {
      priorityBadge.classList.remove("hidden");
      priorityBadge.classList.add("fade-in-up");
    } else if (priorityBadge) {
      priorityBadge.classList.add("hidden");
    }
  }

  saveDraft() {
    const formData = new FormData(document.getElementById("enrollmentForm"));
    const draftData = {};

    for (let [key, value] of formData.entries()) {
      draftData[key] = value;
    }

    // Save to localStorage
    localStorage.setItem("enrollmentDraft", JSON.stringify(draftData));

    // Update status
    this.updateDraftStatus("Draft Saved", "green");

    // Show toast
    this.showToast("Draft saved successfully", "success");
  }

  autoSaveDraft() {
    this.saveDraft();
    this.updateDraftStatus("Draft Saved", "green");
  }

  loadSavedDraft() {
    const savedDraft = localStorage.getItem("enrollmentDraft");
    if (savedDraft) {
      const draftData = JSON.parse(savedDraft);

      // Populate form fields
      Object.keys(draftData).forEach((key) => {
        const field = document.querySelector(`[name="${key}"]`);
        if (field) {
          if (field.type === "checkbox") {
            field.checked = draftData[key] === "on";
          } else {
            field.value = draftData[key];
          }
        }
      });

      this.updateDraftStatus("Draft Loaded", "blue");
    }
  }

  updateDraftStatus(message, color) {
    const draftStatus = document.getElementById("draftStatus");
    if (draftStatus) {
      draftStatus.textContent = message;
      draftStatus.className = `text-sm text-${color}-600 font-medium`;
    }
  }

  showLoadingState() {
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
            `;
    }
  }

  hideLoadingState() {
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = "Continue to Step 2 →";
    }
  }

  showSuccessModal() {
    const modal = document.getElementById("successModal");
    if (modal) {
      modal.classList.remove("hidden");
      modal.classList.add("fade-in-up");
    }
  }

  showDuplicateModal() {
    const modal = document.getElementById("duplicateModal");
    if (modal) {
      modal.classList.remove("hidden");
      modal.classList.add("fade-in-up");
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add("hidden");
    }
  }

  showToast(message, type = "info") {
    // Create toast element
    const toast = document.createElement("div");
    toast.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white ${
      type === "success"
        ? "bg-green-500"
        : type === "error"
        ? "bg-red-500"
        : type === "warning"
        ? "bg-yellow-500"
        : "bg-blue-500"
    }`;
    toast.textContent = message;

    // Add to page
    document.body.appendChild(toast);

    // Remove after 3 seconds
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  startQueueUpdates() {
    // Update queue position and wait time every 30 seconds
    setInterval(() => {
      if (this.queuePosition && this.queuePosition > 1) {
        this.queuePosition--;
        const queuePositionElement = document.getElementById("queuePosition");
        if (queuePositionElement) {
          queuePositionElement.textContent = this.queuePosition;
        }

        if (this.waitTime && this.waitTime > 1) {
          this.waitTime--;
          const waitTimeElement = document.getElementById("waitTime");
          if (waitTimeElement) {
            waitTimeElement.textContent = `${this.waitTime} min`;
          }
        }
      }
    }, 30000);
  }
}

// Initialize the system when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new EnrollmentSystem();

  // Initialize queue statistics
  setTimeout(() => {
    const totalInQueue = document.getElementById("totalInQueue");
    const avgWaitTime = document.getElementById("avgWaitTime");
    const processingRate = document.getElementById("processingRate");

    if (totalInQueue) totalInQueue.textContent = "67";
    if (avgWaitTime) avgWaitTime.textContent = "15 min";
    if (processingRate) processingRate.textContent = "4/min";
  }, 1000);

  // Add event listener for success modal close button
  const closeSuccessModalBtn = document.getElementById("closeSuccessModal");
  if (closeSuccessModalBtn) {
    closeSuccessModalBtn.addEventListener("click", () => {
      const successModal = document.getElementById("successModal");
      if (successModal) {
        successModal.classList.add("hidden");
      }
    });
  }

  // Add event listener for duplicate modal close button
  const closeDuplicateModalBtn = document.getElementById("closeDuplicateModal");
  if (closeDuplicateModalBtn) {
    closeDuplicateModalBtn.addEventListener("click", () => {
      const duplicateModal = document.getElementById("duplicateModal");
      if (duplicateModal) {
        duplicateModal.classList.add("hidden");
      }
    });
  }
});

// Global function for step navigation (accessible from HTML)
function goToStep2() {
  // Check if EnrollmentSystem instance exists
  if (
    window.enrollmentSystem &&
    typeof window.enrollmentSystem.goToStep2 === "function"
  ) {
    window.enrollmentSystem.goToStep2();
  } else {
    // Fallback: validate and navigate directly
    const form = document.getElementById("enrollmentForm");
    if (form) {
      // Basic validation
      const requiredFields = form.querySelectorAll("[required]");
      let isValid = true;

      requiredFields.forEach((field) => {
        if (!field.value.trim()) {
          isValid = false;
          field.classList.add("border-red-500");
        } else {
          field.classList.remove("border-red-500");
        }
      });

      if (isValid) {
        // Save draft and navigate
        const formData = new FormData(form);
        const draftData = {};

        for (let [key, value] of formData.entries()) {
          draftData[key] = value;
        }

        localStorage.setItem("enrollmentDraft", JSON.stringify(draftData));
        window.location.href = "enrollment-step2.html";
      } else {
        alert("Please fill in all required fields before continuing.");
      }
    }
  }
}

// Academic Draft functionality for Step 2
function initializeAcademicDraft() {
  const saveAcademicDraftBtn = document.getElementById("saveAcademicDraftBtn");
  const draftStatus = document.getElementById("draftStatus");

  if (saveAcademicDraftBtn) {
    console.log("Academic Save Draft button found, adding event listener");
    saveAcademicDraftBtn.addEventListener("click", function () {
      console.log("Academic Save Draft button clicked");
      saveAcademicDraft();
    });
  } else {
    console.error("Academic Save Draft button not found");
  }

  // Load saved academic draft when page loads
  loadSavedAcademicDraft();
}

function saveAcademicDraft() {
  console.log("saveAcademicDraft function called");

  const formData = new FormData(document.getElementById("academicForm"));
  const draftData = {};

  for (let [key, value] of formData.entries()) {
    draftData[key] = value;
  }

  console.log("Academic draft data to save:", draftData);

  // Save to localStorage
  localStorage.setItem("academicDraft", JSON.stringify(draftData));

  // Update header status
  const draftStatus = document.getElementById("draftStatus");
  if (draftStatus) {
    draftStatus.innerHTML = "Draft Saved ✓";
    draftStatus.className = "text-sm text-green-600 font-medium";

    // Reset status after 3 seconds
    setTimeout(() => {
      draftStatus.innerHTML = "Draft Saved";
      draftStatus.className = "text-sm text-green-600 font-medium";
    }, 3000);
  } else {
    console.error("Academic draft status element not found");
  }

  console.log("Academic draft saved successfully");
}

function loadSavedAcademicDraft() {
  const savedDraft = localStorage.getItem("academicDraft");
  if (savedDraft) {
    const draftData = JSON.parse(savedDraft);
    Object.keys(draftData).forEach((key) => {
      const field = document.querySelector(`[name="${key}"]`);
      if (field) {
        if (field.type === "checkbox") {
          field.checked = draftData[key] === "on";
        } else {
          field.value = draftData[key];
        }
      }
    });

    // Update draft status to show it's loaded
    updateAcademicDraftStatus();
  }
}

function updateAcademicDraftStatus() {
  const draftStatus = document.getElementById("draftStatus");
  if (draftStatus) {
    draftStatus.innerHTML = "Draft Saved ✓";
    draftStatus.className = "text-sm text-green-600 font-medium";

    // Reset status after 3 seconds
    setTimeout(() => {
      draftStatus.innerHTML = "Draft Saved";
      draftStatus.className = "text-sm text-green-600 font-medium";
    }, 3000);
  }
}

// Initialize academic draft functionality when DOM is loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeAcademicDraft);
} else {
  initializeAcademicDraft();
}

// Step 2 navigation functions
function goToStep1() {
  window.location.href = "enrollment-system.html";
}

function saveAcademicDraft() {
  const form = document.getElementById("academicForm");
  if (!form) return;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  localStorage.setItem("academicDraft", JSON.stringify(data));

  const draftStatus = document.getElementById("draftStatus");
  if (draftStatus) {
    draftStatus.textContent = "Draft Saved!";
    setTimeout(() => (draftStatus.textContent = "Draft Saved"), 2000);
  }
}

function goToStep3() {
  saveAcademicDraft();
  window.location.href = "enrollment-step3.html";
}

document
  .getElementById("saveAcademicDraftBtn")
  ?.addEventListener("click", saveAcademicDraft);

function validateAcademicForm() {
  const requiredFields = ["program", "startTerm", "studyMode"];
  let isValid = true;

  requiredFields.forEach((fieldName) => {
    const field = document.getElementById(fieldName);
    if (!field.value.trim()) {
      field.classList.add("border-red-500");
      isValid = false;
    } else {
      field.classList.remove("border-red-500");
    }
  });

  if (!isValid) {
    alert("Please fill in all required fields marked with *");
  }

  return isValid;
}

// Make navigation functions globally accessible
window.goToStep1 = goToStep1;
window.goToStep3 = goToStep3;

// Global function for submitting enrollment (accessible from HTML)
function submitEnrollment() {
  // Validate terms acceptance
  const termsAccepted = document.getElementById("termsAccepted");
  const dataConsent = document.getElementById("dataConsent");

  if (termsAccepted && dataConsent) {
    if (!termsAccepted.checked || !dataConsent.checked) {
      alert("Please accept the required terms and conditions to continue.");
      return;
    }
  }

  // Show loading state on submit button
  const submitBtn = document.getElementById("submitBtn");
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h5zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
        `;
  }

  // Simulate API call/processing
  setTimeout(() => {
    // Generate queue data
    const queueNumber = Math.floor(Math.random() * 1000) + 1;
    const queuePosition = Math.floor(Math.random() * 50) + 1;
    const waitTime = Math.floor(Math.random() * 30) + 5;

    // Update queue display elements
    const queueNumberElement = document.getElementById("queueNumber");
    const queuePositionElement = document.getElementById("queuePosition");
    const waitTimeElement = document.getElementById("waitTime");

    if (queueNumberElement) queueNumberElement.textContent = queueNumber;
    if (queuePositionElement) queuePositionElement.textContent = queuePosition;
    if (waitTimeElement) waitTimeElement.textContent = `${waitTime} min`;

    // Hide the form and show success message
    const formContainer = document.querySelector(
      ".lg\\:col-span-2 .space-y-6 > div:first-child"
    );
    const successMessage = document.getElementById("successMessage");

    if (formContainer) formContainer.classList.add("hidden");
    if (successMessage) successMessage.classList.remove("hidden");

    // Show success modal
    const successModal = document.getElementById("successModal");
    if (successModal) {
      successModal.classList.remove("hidden");
      successModal.classList.add("fade-in-up");
    }

    // Reset submit button
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = "Submit Application";
    }

    // Start queue updates
    startQueueUpdates(queuePosition, waitTime);
  }, 2000);
}

// Make the function globally accessible
window.submitEnrollmentExternal = submitEnrollment;

// Function to start queue updates
function startQueueUpdates(initialPosition, initialWaitTime) {
  let currentPosition = initialPosition;
  let currentWaitTime = initialWaitTime;

  // Update queue position and wait time every 30 seconds
  const interval = setInterval(() => {
    if (currentPosition > 1) {
      currentPosition--;
      const queuePositionElement = document.getElementById("queuePosition");
      if (queuePositionElement) {
        queuePositionElement.textContent = currentPosition;
      }

      if (currentWaitTime > 1) {
        currentWaitTime--;
        const waitTimeElement = document.getElementById("waitTime");
        if (waitTimeElement) {
          waitTimeElement.textContent = `${currentWaitTime} min`;
        }
      }
    } else {
      // Stop updates when position reaches 1
      clearInterval(interval);
    }
  }, 30000);
}
