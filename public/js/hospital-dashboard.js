// Global variables
let map;
let pandemicChart;
let alertsList = [];
let hospitalsList = [];
const emergencyTypes = [
  "Cardiac Arrest",
  "Traffic Accident",
  "Building Fire",
  "Stroke Patient",
  "Workplace Injury",
  "Severe Allergic Reaction",
  "Drug Overdose",
  "Natural Disaster",
  "Mass Casualty Event",
  "Hazardous Material Spill",
];

const locations = [
  "Downtown District",
  "North Side Hospital",
  "West End Apartments",
  "Central Park",
  "Industrial Zone",
  "Shopping Mall",
  "Highway Interchange",
  "University Campus",
  "Sports Stadium",
  "Elementary School",
];

// Initialize the dashboard
document.addEventListener("DOMContentLoaded", function () {
  // Update current time
  updateTime();
  setInterval(updateTime, 60000); // Update every minute

  // Initialize map
  initMap();

  // Initialize pandemic chart
  initPandemicChart();

  // Generate initial alert list
  generateAlertsList();

  // Generate hospital capacity data
  generateHospitalsList();

  // Initialize tabs
  initTabs();

  // Show welcome toast
  showToast(
    "System Online",
    "Emergency Response Dashboard initialized successfully",
    "info"
  );

  // Initialize modals
  initModals();

  // Add event listeners
  addGlobalEventListeners();

  // Simulate real-time emergencies
  setTimeout(() => {
    simulateEmergencies();
  }, 10000);

  // Refresh data automatically
  setInterval(refreshData, 45000);

  // Hide critical alert after delay
  setTimeout(() => {
    const criticalAlertBar = document.getElementById("criticalAlertBar");
    if (criticalAlertBar) {
      criticalAlertBar.style.display = "none";
    }
  }, 15000);
});

// Update time function
function updateTime() {
  const now = new Date();
  const timeString = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  document.getElementById("current-time").textContent = timeString;
}

// Initialize map
function initMap() {
  if (!document.getElementById("emergency-map")) return;

  map = L.map("emergency-map").setView([37.7749, -122.4194], 12);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  // Add emergency markers
  addEmergencyMarkers();
}

function addEmergencyMarkers() {
  if (!map) return;

  // Clear existing markers
  map.eachLayer((layer) => {
    if (layer instanceof L.Marker) {
      map.removeLayer(layer);
    }
  });

  // Add emergency markers
  const emergencies = [
    {
      lat: 37.7749,
      lng: -122.4194,
      type: "critical",
      title: "Multi-Vehicle Accident",
    },
    { lat: 37.7833, lng: -122.4167, type: "high", title: "Cardiac Emergency" },
    {
      lat: 37.7694,
      lng: -122.4862,
      type: "medium",
      title: "Respiratory Distress",
    },
    { lat: 37.8044, lng: -122.4324, type: "low", title: "Minor Injury" },
    { lat: 37.7624, lng: -122.4124, type: "critical", title: "Building Fire" },
    { lat: 37.7524, lng: -122.4924, type: "high", title: "Gas Leak" },
  ];

  emergencies.forEach((emergency) => {
    const markerIcon = L.divIcon({
      className: `custom-marker ${emergency.type}`,
      html: `<i class="fas fa-exclamation-circle"></i>`,
      iconSize: [30, 30],
    });

    const marker = L.marker([emergency.lat, emergency.lng], {
      icon: markerIcon,
    }).addTo(map);
    marker.bindPopup(`
    <div class="map-popup">
      <h4>${emergency.title}</h4>
      <p>Priority: ${emergency.type}</p>
      <button class="respond-btn" onclick="openResponseModal('${emergency.title}', '${emergency.type}')">Respond</button>
    </div>
  `);
  });
}

// Initialize pandemic chart
function initPandemicChart() {
  const ctx = document.getElementById("pandemic-chart");
  if (!ctx) return;

  // Generate random data
  const labels = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  });

  const newCases = Array.from(
    { length: 7 },
    () => Math.floor(Math.random() * 200) + 100
  );
  const activeCases = Array.from(
    { length: 7 },
    () => Math.floor(Math.random() * 1000) + 500
  );
  const recoveredCases = Array.from(
    { length: 7 },
    () => Math.floor(Math.random() * 150) + 50
  );

  pandemicChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "New Cases",
          data: newCases,
          borderColor: "#d32f2f",
          backgroundColor: "rgba(211, 47, 47, 0.1)",
          borderWidth: 2,
          tension: 0.3,
          fill: true,
        },
        {
          label: "Active Cases",
          data: activeCases,
          borderColor: "#1976d2",
          backgroundColor: "rgba(25, 118, 210, 0.1)",
          borderWidth: 2,
          tension: 0.3,
          fill: true,
        },
        {
          label: "Recovered",
          data: recoveredCases,
          borderColor: "#388e3c",
          backgroundColor: "rgba(56, 142, 60, 0.1)",
          borderWidth: 2,
          tension: 0.3,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
        },
        tooltip: {
          mode: "index",
          intersect: false,
        },
      },
      interaction: {
        mode: "nearest",
        intersect: false,
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

// Generate alerts list
function generateAlertsList() {
  const alertTypes = [
    { type: "critical", icon: "fas fa-exclamation-triangle" },
    { type: "high", icon: "fas fa-ambulance" },
    { type: "medium", icon: "fas fa-heartbeat" },
    { type: "handled", icon: "fas fa-check-circle" },
  ];

  alertsList = [
    {
      id: "EM-2025-0423",
      title: "Multi-Vehicle Accident",
      location: "Highway 101, Mile 245",
      time: "10:23 AM",
      type: alertTypes[0],
      details:
        "Multi-vehicle collision with multiple injuries reported. 3 ambulances requested.",
    },
    {
      id: "EM-2025-0422",
      title: "Cardiac Emergency",
      location: "421 Oak Street",
      time: "10:15 AM",
      type: alertTypes[1],
      details:
        "65-year-old male reporting chest pain and difficulty breathing.",
    },
    {
      id: "EM-2025-0421",
      title: "Respiratory Distress",
      location: "117 Pine Avenue",
      time: "10:04 AM",
      type: alertTypes[1],
      details:
        "32-year-old female with history of asthma reporting severe breathing difficulty.",
    },
    {
      id: "EM-2025-0420",
      title: "Building Fire",
      location: "Downtown District",
      time: "9:47 AM",
      type: alertTypes[0],
      details:
        "Commercial building fire reported. Fire department dispatched. Possible evacuation needed.",
    },
    {
      id: "EM-2025-0419",
      title: "Workplace Injury",
      location: "Industrial Zone",
      time: "9:32 AM",
      type: alertTypes[2],
      details:
        "Worker with severe laceration to arm. Bleeding controlled but requires medical attention.",
    },
    {
      id: "EM-2025-0418",
      title: "Fracture Injury",
      location: "Downtown Park",
      time: "9:15 AM",
      type: alertTypes[3],
      details:
        "Child with suspected arm fracture. Parents transporting to nearest hospital.",
    },
  ];

  renderAlertsList();
}

// Render alerts list to DOM
function renderAlertsList() {
  const alertList = document.getElementById("alertList");
  if (!alertList) return;

  alertList.innerHTML = "";

  alertsList.slice(0, 5).forEach((alert) => {
    const li = document.createElement("li");
    li.className = alert.type.type;
    li.setAttribute("data-id", alert.id);

    li.innerHTML = `
    <div class="alert-icon"><i class="${alert.type.icon}"></i></div>
    <div class="alert-details">
      <h4>${alert.title}</h4>
      <p>${alert.location}</p>
      <span class="alert-time">${alert.time}</span>
    </div>
    <div class="alert-actions">
      ${
        alert.type.type !== "handled"
          ? '<button class="respond-btn"><i class="fas fa-reply"></i> Respond</button>'
          : '<span class="status-badge">Handled</span>'
      }
    </div>
  `;

    alertList.appendChild(li);

    // Add click event for response button
    if (alert.type.type !== "handled") {
      const respondBtn = li.querySelector(".respond-btn");
      respondBtn.addEventListener("click", () => {
        openResponseModal(alert.title, alert.type.type, alert.id);
      });
    }
  });
}

// Generate hospital capacity data
function generateHospitalsList() {
  const hospitalNames = [
    "Central Hospital",
    "Mercy Medical Center",
    "University Hospital",
    "Children's Hospital",
    "Veterans Hospital",
    "County General",
    "Memorial Hospital",
    "St. John's Medical",
  ];

  hospitalsList = hospitalNames.map((name) => {
    const beds = Math.floor(Math.random() * 30) + 20;
    const bedsAvailable = Math.floor(Math.random() * beds);
    const icu = Math.floor(Math.random() * 10) + 5;
    const icuAvailable = Math.floor(Math.random() * icu);

    return {
      name,
      beds,
      bedsAvailable,
      icu,
      icuAvailable,
      status:
        bedsAvailable < 5
          ? "critical"
          : bedsAvailable < 10
          ? "warning"
          : "good",
    };
  });

  renderHospitalsList();
}

// Render hospitals list to DOM
function renderHospitalsList() {
  const hospitalGrid = document.getElementById("hospitalGrid");
  if (!hospitalGrid) return;

  hospitalGrid.innerHTML = "";

  hospitalsList.forEach((hospital) => {
    const card = document.createElement("div");
    card.className = "hospital-card";

    card.innerHTML = `
    <h3 class="hospital-name">${hospital.name}</h3>
    <div class="hospital-status">
      <div class="status-item">
        <span>Beds:</span>
        <span class="status-value ${
          hospital.bedsAvailable < 5
            ? "status-critical"
            : hospital.bedsAvailable < 10
            ? "status-warning"
            : "status-good"
        }">
          ${hospital.bedsAvailable}/${hospital.beds}
        </span>
      </div>
      <div class="status-item">
        <span>ICU:</span>
        <span class="status-value ${
          hospital.icuAvailable < 2
            ? "status-critical"
            : hospital.icuAvailable < 4
            ? "status-warning"
            : "status-good"
        }">
          ${hospital.icuAvailable}/${hospital.icu}
        </span>
      </div>
    </div>
  `;

    hospitalGrid.appendChild(card);
  });
}

// Initialize tabs
function initTabs() {
  const tabs = document.querySelectorAll(".comm-tab");
  if (!tabs.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      // Remove active class from all tabs and content
      document
        .querySelectorAll(".comm-tab")
        .forEach((t) => t.classList.remove("active"));
      document
        .querySelectorAll(".communication-content")
        .forEach((c) => c.classList.remove("active"));

      // Add active class to clicked tab
      tab.classList.add("active");

      // Show corresponding content
      const target = tab.getAttribute("data-target");
      document.getElementById(target).classList.add("active");
    });
  });
}

// Show toast notification
function showToast(title, message, type = "info", duration = 5000) {
  const toastContainer = document.getElementById("toastContainer");
  if (!toastContainer) return;

  // Create toast element
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  // Get icon based on type
  let iconClass;
  switch (type) {
    case "success":
      iconClass = "fas fa-check-circle";
      break;
    case "warning":
      iconClass = "fas fa-exclamation-triangle";
      break;
    case "error":
      iconClass = "fas fa-times-circle";
      break;
    default:
      iconClass = "fas fa-info-circle";
  }

  // Toast content
  toast.innerHTML = `
  <div class="toast-icon">
    <i class="${iconClass}"></i>
  </div>
  <div class="toast-content">
    <h4 class="toast-title">${title}</h4>
    <p class="toast-message">${message}</p>
  </div>
  <button class="toast-close">
    <i class="fas fa-times"></i>
  </button>
`;

  // Add to container
  toastContainer.appendChild(toast);

  // Add close event
  const closeBtn = toast.querySelector(".toast-close");
  closeBtn.addEventListener("click", () => {
    closeToast(toast);
  });

  // Auto close after duration
  setTimeout(() => {
    if (toastContainer.contains(toast)) {
      closeToast(toast);
    }
  }, duration);
}

// Close toast function
function closeToast(toast) {
  toast.classList.add("fade-out");
  setTimeout(() => {
    const toastContainer = document.getElementById("toastContainer");
    if (toastContainer && toastContainer.contains(toast)) {
      toastContainer.removeChild(toast);
    }
  }, 300);
}

// Initialize modals
function initModals() {
  // Regular modal
  const modalOverlay = document.getElementById("modalOverlay");
  const closeModal = document.getElementById("closeModal");
  const cancelModal = document.getElementById("cancelModal");
  const modal = document.getElementById("modal");

  if (modalOverlay && closeModal && cancelModal && modal) {
    // Close modal when clicking close button
    closeModal.addEventListener("click", () => {
      modalOverlay.classList.remove("active");
    });

    // Close modal when clicking cancel button
    cancelModal.addEventListener("click", () => {
      modalOverlay.classList.remove("active");
    });

    // Close modal when clicking outside
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.classList.remove("active");
      }
    });
  }

  // Response modal
  const responseModalOverlay = document.getElementById("responseModalOverlay");
  const closeResponseModal = document.getElementById("closeResponseModal");
  const cancelResponse = document.getElementById("cancelResponse");
  const confirmResponse = document.getElementById("confirmResponse");

  if (
    responseModalOverlay &&
    closeResponseModal &&
    cancelResponse &&
    confirmResponse
  ) {
    // Close modal when clicking close button
    closeResponseModal.addEventListener("click", () => {
      responseModalOverlay.classList.remove("active");
    });

    // Close modal when clicking cancel button
    cancelResponse.addEventListener("click", () => {
      responseModalOverlay.classList.remove("active");
    });

    // Handle response submission
    confirmResponse.addEventListener("click", () => {
      handleResponseSubmission();
      responseModalOverlay.classList.remove("active");
    });

    // Close modal when clicking outside
    responseModalOverlay.addEventListener("click", (e) => {
      if (e.target === responseModalOverlay) {
        responseModalOverlay.classList.remove("active");
      }
    });
  }
}

// Open response modal
function openResponseModal(title, type, id = "") {
  const responseModalOverlay = document.getElementById("responseModalOverlay");
  const responseModalTitle = document.getElementById("responseModalTitle");
  const emergencyTypeSelect = document.getElementById("emergencyType");
  const responseLocationInput = document.getElementById("responseLocation");
  const responseLevelSelect = document.getElementById("responseLevel");

  if (
    responseModalOverlay &&
    responseModalTitle &&
    emergencyTypeSelect &&
    responseLocationInput &&
    responseLevelSelect
  ) {
    // Set modal title
    responseModalTitle.textContent = `Respond to ${title}`;

    // Pre-fill form if available
    if (id) {
      const alert = alertsList.find((a) => a.id === id);
      if (alert) {
        responseLocationInput.value = alert.location;

        // Set appropriate emergency type
        if (alert.title.includes("Cardiac")) {
          emergencyTypeSelect.value = "medical";
        } else if (alert.title.includes("Accident")) {
          emergencyTypeSelect.value = "trauma";
        } else if (alert.title.includes("Fire")) {
          emergencyTypeSelect.value = "fire";
        }

        // Set appropriate response level based on alert type
        if (alert.type.type === "critical") {
          responseLevelSelect.value = "4";
        } else if (alert.type.type === "high") {
          responseLevelSelect.value = "3";
        } else if (alert.type.type === "medium") {
          responseLevelSelect.value = "2";
        } else {
          responseLevelSelect.value = "1";
        }
      }
    } else {
      // Clear form
      responseLocationInput.value = "";
      // Set type based on emergencyType
      if (
        title.includes("Cardiac") ||
        title.includes("Respiratory") ||
        title.includes("Stroke")
      ) {
        emergencyTypeSelect.value = "medical";
      } else if (title.includes("Accident") || title.includes("Injury")) {
        emergencyTypeSelect.value = "trauma";
      } else if (title.includes("Fire")) {
        emergencyTypeSelect.value = "fire";
      } else {
        emergencyTypeSelect.value = "other";
      }

      // Set response level based on type
      if (type === "critical") {
        responseLevelSelect.value = "4";
      } else if (type === "high") {
        responseLevelSelect.value = "3";
      } else if (type === "medium") {
        responseLevelSelect.value = "2";
      } else {
        responseLevelSelect.value = "1";
      }
    }

    // Reset checkboxes
    document.getElementById("notifyHospitals").checked = true;
    document.getElementById("requestBackup").checked = false;
    document.getElementById("activateProtocol").checked = false;

    // Show modal
    responseModalOverlay.classList.add("active");
  }
}

// Handle response submission
function handleResponseSubmission() {
  const emergencyType = document.getElementById("emergencyType").value;
  const responseLevel = document.getElementById("responseLevel").value;
  const location = document.getElementById("responseLocation").value;
  const units = document.getElementById("responseUnits").value;
  const eta = document.getElementById("responseETA").value;
  const notifyHospitals = document.getElementById("notifyHospitals").checked;
  const requestBackup = document.getElementById("requestBackup").checked;
  const activateProtocol = document.getElementById("activateProtocol").checked;

  // Create success message
  let message = `Response dispatched to ${location}. `;
  message += `${units} units en route with ETA of ${eta} minutes.`;

  if (notifyHospitals) {
    message += " Nearby hospitals notified.";
  }

  if (requestBackup) {
    message += " Backup requested.";
  }

  if (activateProtocol) {
    message += " Emergency protocol activated.";
  }

  // Show success toast
  showToast("Response Dispatched", message, "success");

  // Update stats to simulate response
  updateEmergencyStats();
}

// Add global event listeners
function addGlobalEventListeners() {
  // Allocate resources button
  const allocateBtn = document.querySelector(".allocate-btn");
  if (allocateBtn) {
    allocateBtn.addEventListener("click", () => {
      showToast(
        "Resources Allocated",
        "Emergency resources have been allocated to high priority incidents",
        "success"
      );
    });
  }

  // Deploy team button
  const deployBtn = document.querySelector(".deploy-btn");
  if (deployBtn) {
    deployBtn.addEventListener("click", () => {
      openResponseModal("Team Deployment", "high");
    });
  }

  // Recall team button
  const recallBtn = document.querySelector(".recall-btn");
  if (recallBtn) {
    recallBtn.addEventListener("click", () => {
      showToast(
        "Team Recalled",
        "Emergency response team has been recalled to base",
        "info"
      );
      updateTeamCounts(-1, 1);
    });
  }

  // Rotate staff button
  const rotateBtn = document.querySelector(".rotate-btn");
  if (rotateBtn) {
    rotateBtn.addEventListener("click", () => {
      showToast(
        "Staff Rotation",
        "Staff rotation schedule has been updated",
        "info"
      );
    });
  }

  // Send broadcast button
  const sendBroadcastBtn = document.querySelector(".send-broadcast");
  if (sendBroadcastBtn) {
    sendBroadcastBtn.addEventListener("click", () => {
      const broadcastMessage = document.getElementById("broadcastMessage");
      if (broadcastMessage && broadcastMessage.value.trim()) {
        // Add broadcast to list
        addBroadcast(broadcastMessage.value.trim());
        // Clear input
        broadcastMessage.value = "";
        // Show toast
        showToast(
          "Broadcast Sent",
          "Emergency broadcast has been sent to all selected recipients",
          "success"
        );
      }
    });
  }

  // Refresh button
  const refreshBtn = document.querySelector(".refresh-btn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      refreshMap();
      showToast(
        "Map Refreshed",
        "Emergency location map has been refreshed with latest data",
        "info"
      );
    });
  }

  // Report action buttons
  const reportBtns = document.querySelectorAll(".report-btn");
  reportBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const action = this.textContent.includes("Download")
        ? "downloaded"
        : "shared";
      const reportTitle =
        this.closest(".report-card").querySelector(
          ".report-header h3"
        ).textContent;
      showToast(
        "Report Action",
        `Report "${reportTitle}" ${action} successfully`,
        "success"
      );
    });
  });
}

// Add new broadcast to list
function addBroadcast(message) {
  const broadcastList = document.querySelector(".broadcast-list");
  if (!broadcastList) return;

  const now = new Date();
  const timeString = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const li = document.createElement("li");
  li.className = "broadcast-item";

  li.innerHTML = `
  <span class="broadcast-time">${timeString}</span>
  <span class="broadcast-message">${message}</span>
`;

  // Insert at top of list
  broadcastList.insertBefore(li, broadcastList.firstChild);
}

// Simulate emergencies
function simulateEmergencies() {
  // 30% chance of new emergency every 30-60 seconds
  setInterval(() => {
    if (Math.random() > 0.7) {
      createRandomEmergency();
    }
  }, Math.floor(Math.random() * 30000) + 30000);
}

// Create random emergency
function createRandomEmergency() {
  const emergencyType =
    emergencyTypes[Math.floor(Math.random() * emergencyTypes.length)];
  const location = locations[Math.floor(Math.random() * locations.length)];
  const now = new Date();
  const timeString = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Choose priority randomly weighted towards medium
  const priorities = ["critical", "high", "high", "medium", "medium", "medium"];
  const priority = priorities[Math.floor(Math.random() * priorities.length)];

  const alertTypes = [
    { type: "critical", icon: "fas fa-exclamation-triangle" },
    { type: "high", icon: "fas fa-ambulance" },
    { type: "medium", icon: "fas fa-heartbeat" },
  ];

  const alertType =
    alertTypes.find((a) => a.type === priority) || alertTypes[2];

  // Generate ID
  const id = `EM-2025-${Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")}`;

  // Create alert
  const newAlert = {
    id,
    title: emergencyType,
    location,
    time: timeString,
    type: alertType,
    details: `New ${emergencyType.toLowerCase()} incident reported at ${location}.`,
  };

  // Add to beginning of alerts list
  alertsList.unshift(newAlert);

  // Update DOM
  renderAlertsList();

  // Show toast
  showToast(
    "New Emergency Alert",
    `${emergencyType} reported at ${location}`,
    "warning"
  );

  // Update emergency count in alert banner
  updateEmergencyCount(1);
}

// Update emergency count in alert banner
function updateEmergencyCount(change = 0) {
  const alertBannerText = document.querySelector("#alertBanner span");
  if (!alertBannerText) return;

  // Extract current count
  const currentText = alertBannerText.textContent;
  const currentCount = parseInt(currentText.match(/\d+/)[0]);

  // Update count
  const newCount = currentCount + change;
  alertBannerText.textContent = `${newCount} Critical Emergencies Active`;
}

// Update team counts
function updateTeamCounts(deployedChange = 0, availableChange = 0) {
  const teamCounts = document.querySelectorAll(".team-count");
  if (teamCounts.length < 2) return;

  const availableCount = parseInt(teamCounts[0].textContent);
  const deployedCount = parseInt(teamCounts[1].textContent);

  teamCounts[0].textContent = availableCount + availableChange;
  teamCounts[1].textContent = deployedCount + deployedChange;
}

// Update emergency stats after response
function updateEmergencyStats() {
  // Get current value
  const statValue = document.querySelector(".stat-card.emergency .stat-value");
  if (!statValue) return;

  const currentValue = parseInt(statValue.textContent);

  // Decrease by 1
  statValue.textContent = currentValue - 1;

  // Update emergency count in banner
  updateEmergencyCount(-1);

  // Update team counts
  updateTeamCounts(-1, 1);

  // Mark random alert as handled
  markRandomAlertHandled();
}

// Mark random alert as handled
function markRandomAlertHandled() {
  // Find alerts that are not already handled
  const activeAlerts = alertsList.filter(
    (alert) => alert.type.type !== "handled"
  );
  if (activeAlerts.length === 0) return;

  // Pick a random active alert
  const randomAlert =
    activeAlerts[Math.floor(Math.random() * activeAlerts.length)];

  // Mark as handled
  const index = alertsList.findIndex((alert) => alert.id === randomAlert.id);
  if (index !== -1) {
    alertsList[index].type = { type: "handled", icon: "fas fa-check-circle" };

    // Update DOM
    renderAlertsList();
  }
}

// Refresh data functions
function refreshData() {
  // Refresh map occasionally
  if (Math.random() > 0.7) {
    refreshMap();
  }

  // Update hospital data occasionally
  if (Math.random() > 0.6) {
    updateHospitalData();
  }

  // Update pandemic chart occasionally
  if (Math.random() > 0.8) {
    updatePandemicChart();
  }
}

// Refresh map
function refreshMap() {
  // Re-add markers to simulate refresh
  addEmergencyMarkers();
}

// Update hospital data
function updateHospitalData() {
  // Update availability numbers slightly
  hospitalsList = hospitalsList.map((hospital) => {
    let bedsChange = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
    let icuChange = Math.floor(Math.random() * 2) - 1; // -1, 0, or 1

    let bedsAvailable = Math.max(
      0,
      Math.min(hospital.beds, hospital.bedsAvailable + bedsChange)
    );
    let icuAvailable = Math.max(
      0,
      Math.min(hospital.icu, hospital.icuAvailable + icuChange)
    );

    return {
      ...hospital,
      bedsAvailable,
      icuAvailable,
      status:
        bedsAvailable < 5
          ? "critical"
          : bedsAvailable < 10
          ? "warning"
          : "good",
    };
  });

  // Update DOM
  renderHospitalsList();
}

// Update pandemic chart
function updatePandemicChart() {
  if (!pandemicChart) return;

  // Update last data point slightly
  const datasets = pandemicChart.data.datasets;

  datasets.forEach((dataset) => {
    const lastValue = dataset.data[dataset.data.length - 1];
    const change = Math.floor(Math.random() * 21) - 10; // -10 to 10
    dataset.data[dataset.data.length - 1] = Math.max(0, lastValue + change);
  });

  pandemicChart.update();
}
