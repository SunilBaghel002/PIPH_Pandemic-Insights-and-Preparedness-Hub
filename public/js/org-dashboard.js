// Popup Functions
const popup = document.getElementById("popup");
const popupText = document.getElementById("popup-text");
const closePopupButton = document.getElementById("close-popup");

closePopupButton.addEventListener(
  "click",
  () => (popup.style.display = "none")
);

function showPopupMessage(message) {
  popupText.textContent = message;
  popup.style.display = "flex";
  setTimeout(() => (popup.style.display = "none"), 3000);
}

// Volunteer Modal Functions
function openVolunteerModal() {
  document.getElementById("volunteer-modal").style.display = "flex";
  showTab("individual");
  fetchOrganizationsForJoin();
}

function closeVolunteerModal() {
  document.getElementById("volunteer-modal").style.display = "none";
  resetForms();
}

function showTab(tabId) {
  const tabs = document.querySelectorAll(".tab-btn");
  const forms = document.querySelectorAll(".volunteer-form");
  tabs.forEach((btn) => btn.classList.remove("active"));
  forms.forEach((form) => form.classList.remove("active"));
  document
    .querySelector(`[onclick="showTab('${tabId}')"]`)
    .classList.add("active");
  document.getElementById(`${tabId}-form`).classList.add("active");
  updateProgress(tabId, 1);
}

function updateProgress(formId, step) {
  document.getElementById("progress").style.width = step === 1 ? "50%" : "100%";
}

function nextStep(formId, step) {
  const currentStep = document.querySelector(
    `#${formId}-form .form-step[data-step="${step - 1}"]`
  );
  const nextStep = document.querySelector(
    `#${formId}-form .form-step[data-step="${step}"]`
  );
  currentStep.classList.add("hidden");
  nextStep.classList.remove("hidden");
  updateProgress(formId, step);
}

function prevStep(formId, step) {
  const currentStep = document.querySelector(
    `#${formId}-form .form-step[data-step="${step + 1}"]`
  );
  const prevStep = document.querySelector(
    `#${formId}-form .form-step[data-step="${step}"]`
  );
  currentStep.classList.add("hidden");
  prevStep.classList.remove("hidden");
  updateProgress(formId, step);
}

function resetForms() {
  document.querySelectorAll(".volunteer-form").forEach((form) => {
    form.reset();
    form
      .querySelectorAll(".form-step")
      .forEach((step) => step.classList.add("hidden"));
    form.querySelector(".form-step[data-step='1']").classList.remove("hidden");
  });
  updateProgress("individual", 1);
}

// Event Modal Functions
function openEventModal() {
  document.getElementById("event-modal").style.display = "flex";
}

function closeEventModal() {
  document.getElementById("event-modal").style.display = "none";
  document.getElementById("event-form").reset();
}

// Task Modal Functions
function openTaskModal() {
  document.getElementById("task-modal").style.display = "flex";
  populateTaskVolunteers();
}

function closeTaskModal() {
  document.getElementById("task-modal").style.display = "none";
  document.getElementById("task-form").reset();
}

// Notification Functions
function toggleNotifications() {
  const dropdown = document.getElementById("notification-dropdown");
  dropdown.style.display =
    dropdown.style.display === "block" ? "none" : "block";
}

// Fetch Overview Data
async function fetchOverview() {
  try {
    const response = await fetch("http://localhost:5000/api/org/overview", {
      headers: { Authorization: localStorage.getItem("token") },
    });
    const data = await response.json();
    document.getElementById("volunteer-count").textContent =
      data.volunteers || 0;
    document.getElementById("project-count").textContent = data.projects || 0;
    document.getElementById("beneficiary-count").textContent =
      data.beneficiaries || 0;
    document.getElementById("hours-volunteered").textContent =
      data.hoursVolunteered || 0;
  } catch (error) {
    console.error("Error fetching overview:", error);
    showPopupMessage("Failed to load overview data.");
  }
}

// Fetch Volunteers and Chart
async function fetchVolunteers() {
  try {
    const response = await fetch("http://localhost:5000/api/org/volunteers", {
      headers: { Authorization: localStorage.getItem("token") },
    });
    const volunteers = await response.json();
    const volunteerList = document.getElementById("volunteer-list");
    volunteerList.innerHTML = "";
    volunteers.forEach((volunteer) => {
      const card = document.createElement("div");
      card.className = "volunteer-card";
      card.innerHTML = `
        <h3>${volunteer.name}</h3>
        <p><i class="fa-solid fa-envelope"></i> ${volunteer.email}</p>
        <p><i class="fa-solid fa-briefcase"></i> ${
          volunteer.skills || "N/A"
        }</p>
        <p><i class="fa-solid fa-trophy"></i> Badges: <span class="badges">${
          volunteer.badges || "None"
        }</span></p>
      `;
      volunteerList.appendChild(card);
    });

    // Volunteer Chart
    const skillCounts = volunteers.reduce((acc, v) => {
      acc[v.skills || "Other"] = (acc[v.skills || "Other"] || 0) + 1;
      return acc;
    }, {});
    const ctx = document.getElementById("volunteer-chart").getContext("2d");
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: Object.keys(skillCounts),
        datasets: [
          {
            label: "Volunteers by Skill",
            data: Object.values(skillCounts),
            backgroundColor: "#2563eb",
          },
        ],
      },
      options: { scales: { y: { beginAtZero: true } } },
    });

    // Spotlight (assuming first volunteer as example)
    if (volunteers.length > 0) {
      document.getElementById("spotlight-photo").src =
        volunteers[0].photo || "/images/default-photo.png";
      document.getElementById("spotlight-name").textContent =
        volunteers[0].name;
      document.getElementById("spotlight-bio").textContent =
        volunteers[0].bio || "A dedicated volunteer!";
    }

    ScrollReveal().reveal(".volunteer-card", {
      delay: 200,
      distance: "50px",
      origin: "bottom",
      interval: 100,
    });
  } catch (error) {
    console.error("Error fetching volunteers:", error);
    showPopupMessage("Failed to load volunteers.");
  }
}

// Fetch Events and Calendar
async function fetchEvents() {
  try {
    const response = await fetch("http://localhost:5000/api/org/events", {
      headers: { Authorization: localStorage.getItem("token") },
    });
    const events = await response.json();
    const eventList = document.getElementById("event-list");
    eventList.innerHTML = "";
    events.forEach((event) => {
      const card = document.createElement("div");
      card.className = "event-card";
      card.innerHTML = `
        <h3>${event.name}</h3>
        <p><i class="fa-solid fa-align-left"></i> ${event.description.slice(
          0,
          100
        )}...</p>
        <p><i class="fa-solid fa-clock"></i> ${new Date(
          event.date
        ).toLocaleString()}</p>
      `;
      eventList.appendChild(card);
    });

    // Event Calendar
    const calendarEl = document.getElementById("event-calendar");
    const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: "dayGridMonth",
      events: events.map((e) => ({ title: e.name, start: e.date })),
    });
    calendar.render();

    ScrollReveal().reveal(".event-card", {
      delay: 200,
      distance: "50px",
      origin: "bottom",
      interval: 100,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    showPopupMessage("Failed to load events.");
  }
}

// Fetch Tasks
async function fetchTasks() {
  try {
    const response = await fetch("http://localhost:5000/api/org/tasks", {
      headers: { Authorization: localStorage.getItem("token") },
    });
    const tasks = await response.json();
    const taskList = document.getElementById("task-list");
    taskList.innerHTML = "";
    tasks.forEach((task) => {
      const card = document.createElement("div");
      card.className = "task-card";
      card.innerHTML = `
        <h3>${task.volunteerName}</h3>
        <p><i class="fa-solid fa-align-left"></i> ${task.description}</p>
      `;
      taskList.appendChild(card);
    });
    ScrollReveal().reveal(".task-card", {
      delay: 200,
      distance: "50px",
      origin: "bottom",
      interval: 100,
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    showPopupMessage("Failed to load tasks.");
  }
}

// Fetch Resources
async function fetchResources() {
  try {
    const response = await fetch("http://localhost:5000/api/org/resources", {
      headers: { Authorization: localStorage.getItem("token") },
    });
    const resources = await response.json();
    const resourceList = document.getElementById("resource-list");
    resourceList.innerHTML = "";
    resources.forEach((resource) => {
      const card = document.createElement("div");
      card.className = "resource-card";
      card.innerHTML = `
        <h3>${resource.name}</h3>
        <p><i class="fa-solid fa-box"></i> Quantity: ${resource.quantity}</p>
      `;
      resourceList.appendChild(card);
    });
    ScrollReveal().reveal(".resource-card", {
      delay: 200,
      distance: "50px",
      origin: "bottom",
      interval: 100,
    });
  } catch (error) {
    console.error("Error fetching resources:", error);
    showPopupMessage("Failed to load resources.");
  }
}

// Fetch Profile and Stories
async function fetchProfile() {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found in localStorage");
      showPopupMessage("Please log in to access this page.");
      window.location.href = "/login"; // Redirect to login if no token
      return;
    }

    const response = await fetch("http://localhost:5000/api/org/profile", {
      headers: { Authorization: `Bearer ${token}` }, // Ensure Bearer prefix
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const profile = await response.json();
    document.getElementById("org-bio").value = profile.bio || "";
    const storiesContainer = document.getElementById("stories");
    storiesContainer.innerHTML = "";
    (profile.stories || []).forEach((story) => {
      const card = document.createElement("div");
      card.className = "story-card";
      card.innerHTML = `<p>${story}</p>`;
      storiesContainer.appendChild(card);
    });
    ScrollReveal().reveal(".story-card", {
      delay: 200,
      distance: "50px",
      origin: "bottom",
      interval: 100,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    showPopupMessage("Failed to load profile. Please log in again.");
  }
}

// Submit Event
document.getElementById("event-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = {
    name: document.getElementById("event-name").value,
    description: document.getElementById("event-description").value,
    date: document.getElementById("event-date").value,
  };
  try {
    const response = await fetch("http://localhost:5000/api/org/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token"),
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create event");
    showPopupMessage("Event created successfully!");
    closeEventModal();
    fetchEvents();
  } catch (error) {
    console.error("Error creating event:", error);
    showPopupMessage("Failed to create event.");
  }
});

// Submit Task
document.getElementById("task-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = {
    volunteerId: document.getElementById("task-volunteer").value,
    description: document.getElementById("task-description").value,
  };
  try {
    const response = await fetch("http://localhost:5000/api/org/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token"),
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to assign task");
    showPopupMessage("Task assigned successfully!");
    closeTaskModal();
    fetchTasks();
  } catch (error) {
    console.error("Error assigning task:", error);
    showPopupMessage("Failed to assign task.");
  }
});

// Submit Profile
document
  .getElementById("org-profile-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("cover", document.getElementById("org-cover").files[0]);
    formData.append("logo", document.getElementById("org-logo").files[0]);
    formData.append("bio", document.getElementById("org-bio").value);
    try {
      const response = await fetch("http://localhost:5000/api/org/profile", {
        method: "POST",
        headers: { Authorization: localStorage.getItem("token") },
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to update profile");
      showPopupMessage("Profile updated successfully!");
      fetchProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
      showPopupMessage("Failed to update profile.");
    }
  });

// Fetch Organizations for Join Modal
async function fetchOrganizationsForJoin() {
  try {
    const response = await fetch("http://localhost:5000/api/organizations");
    const orgs = await response.json();
    const orgList = document.getElementById("org-list");
    orgList.innerHTML = "";
    orgs.forEach((org) => {
      const div = document.createElement("div");
      div.className = "org-item";
      div.textContent = `${org.name} (${org.location})`;
      div.dataset.orgId = org._id;
      div.onclick = () => {
        document
          .querySelectorAll(".org-item")
          .forEach((item) => item.classList.remove("selected"));
        div.classList.add("selected");
      };
      orgList.appendChild(div);
    });
  } catch (error) {
    console.error("Error fetching organizations:", error);
    showPopupMessage("Failed to load organizations.");
  }
}

// Populate Task Volunteers
async function populateTaskVolunteers() {
  try {
    const response = await fetch("http://localhost:5000/api/org/volunteers", {
      headers: { Authorization: localStorage.getItem("token") },
    });
    const volunteers = await response.json();
    const select = document.getElementById("task-volunteer");
    select.innerHTML = '<option value="">Select Volunteer</option>';
    volunteers.forEach((volunteer) => {
      const option = document.createElement("option");
      option.value = volunteer._id;
      option.textContent = volunteer.name;
      select.appendChild(option);
    });
  } catch (error) {
    console.error("Error fetching volunteers for task:", error);
    showPopupMessage("Failed to load volunteers for task assignment.");
  }
}

// Submit Volunteer Form
async function submitVolunteer(data) {
  try {
    const response = await fetch("http://localhost:5000/api/volunteer/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token"),
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to submit volunteer data");
    showPopupMessage("Volunteer signup successful!");
    closeVolunteerModal();
  } catch (error) {
    console.error("Error submitting volunteer data:", error);
    showPopupMessage("Error during signup.");
  }
}

// Export Data (Placeholder)
function exportData(type) {
  showPopupMessage(`Exporting ${type} data... (Feature under development)`);
  // Implement CSV/PDF export logic here
}

// Simulate WebSocket Notifications
function simulateNotifications() {
  setInterval(() => {
    const count =
      parseInt(document.getElementById("notification-count").textContent) + 1;
    document.getElementById("notification-count").textContent = count;
    const dropdown = document.getElementById("notification-dropdown");
    dropdown.innerHTML += `<p>New volunteer signed up!</p>`;
  }, 10000); // Every 10 seconds for demo
}

// AI Suggestions (Placeholder)
function fetchSuggestions() {
  // Simulate AI suggestion
  setTimeout(() => {
    document.getElementById("suggestion-text").textContent =
      "Assign a logistics task to a volunteer with relevant skills.";
  }, 2000);
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  fetchOverview();
  fetchVolunteers();
  fetchEvents();
  fetchTasks();
  fetchResources();
  fetchProfile();
  simulateNotifications();
  fetchSuggestions();

  document
    .getElementById("individual-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = {
        name: document.getElementById("ind-name").value,
        email: document.getElementById("ind-email").value,
        phone: `${document.getElementById("ind-country-code").value}${
          document.getElementById("ind-phone").value
        }`,
        skills: document.getElementById("ind-skills").value,
        type: "individual",
      };
      await submitVolunteer(data);
    });

  document
    .getElementById("create-org-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = {
        name: document.getElementById("org-name").value,
        email: document.getElementById("org-email").value,
        location: document.getElementById("org-location").value,
        description: document.getElementById("org-description").value,
        type: "create-org",
      };
      await submitVolunteer(data);
    });

  document
    .getElementById("join-org-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const selectedOrg = document.querySelector(".org-item.selected");
      if (!selectedOrg) {
        showPopupMessage("Please select an organization.");
        return;
      }
      const data = {
        name: document.getElementById("join-name").value,
        email: document.getElementById("join-email").value,
        orgId: selectedOrg.dataset.orgId,
        type: "join-org",
      };
      await submitVolunteer(data);
    });

  // Navbar Active State
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      document
        .querySelectorAll(".nav-link")
        .forEach((l) => l.classList.remove("active"));
      link.classList.add("active");
    });
  });
});
