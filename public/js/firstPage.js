// Chart Instances
let historicalChartInstance = null;
let pieChartInstance = null;

// Popup Functions
const popup = document.getElementById("popup");
const popupText = document.getElementById("popup-text");
const closePopupButton = document.getElementById("close-popup");

if (closePopupButton) {
  closePopupButton.addEventListener("click", () => {
    popup.style.display = "none";
  });
}

function showPopupMessage(message) {
  if (popupText && popup) {
    popupText.textContent = message;
    popup.style.display = "flex";
    setTimeout(() => (popup.style.display = "none"), 3000);
  } else {
    console.error("Popup elements not found");
  }
}

// Scroll to Section
function scrollToSection(id) {
  const section = document.getElementById(id);
  if (section) {
    section.scrollIntoView({ behavior: "smooth" });
    highlightNavLink(id);
  } else {
    console.error(`Section #${id} not found`);
  }
}

// Highlight Navbar Link
function highlightNavLink(sectionId) {
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    if (link.getAttribute("href") === `#${sectionId}`) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

// Intersection Observer for Navbar Highlighting
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        highlightNavLink(entry.target.id);
      }
    });
  },
  { threshold: 0.5 }
);

// Enhanced Tutorial System with Sidebar Focus and Local Storage
const tutorialSteps = [
  {
    title: "Welcome to Pandemic Response!",
    text: "This tutorial will guide you through the key features, starting with the Sidebar. Let’s begin!",
    element: "#sidebar",
  },
  {
    title: "Dashboard",
    text: "Click 'Dashboard' to access the main control panel with an overview of all features.",
    element: ".sidebar-link[href='/firstPage']",
  },
  {
    title: "Live Pandemic Stats",
    text: "View real-time global or country-specific pandemic data with interactive charts.",
    element: ".sidebar-link[href='/pandamic']",
  },
  {
    title: "Need Resources",
    text: "Request essential supplies here. Fill out a form, and volunteers will assist after approval.",
    element: ".sidebar-link[href='/request']",
  },
  {
    title: "Find Hospitals",
    text: "Locate nearby hospitals and send alerts for immediate help if needed.",
    element: ".sidebar-link[href='/map']",
  },
  {
    title: "Graph Analytics",
    text: "Dive into detailed graphs and analytics to understand pandemic trends.",
    element: ".sidebar-link[href='/stats']",
  },
  {
    title: "Organizations",
    text: "Explore or join organizations helping with pandemic response efforts.",
    element: ".sidebar-link[href='/organizations']",
  },
  {
    title: "Org Dashboard",
    text: "Manage your organization’s volunteers, projects, and resources here.",
    element: ".sidebar-link[href='/org-dashboard']",
  },
  {
    title: "User Dashboard",
    text: "Track your volunteer activities, tasks, and contributions in this personal dashboard.",
    element: ".sidebar-link[href='/user-dashboard']",
  },
  {
    title: "Alerts",
    text: "Stay updated with notifications about critical updates or emergencies.",
    element: ".sidebar-link[href='/alerts']",
  },
  {
    title: "Profile",
    text: "View and edit your personal information and settings here.",
    element: ".sidebar-link[href='/profile']",
  },
  {
    title: "Main Page Features",
    text: "Now explore the main page! Use the Navbar or scroll to see Stats, Resources, and FAQs.",
    element: ".navbar",
  },
  {
    title: "All Set!",
    text: "You’re ready to use the dashboard! Click any Sidebar link to get started.",
    element: null,
  },
];

let currentStep = 0;
const tutorialOverlay = document.getElementById("tutorial-overlay");
const tutorialTitle = document.getElementById("tutorial-title");
const tutorialText = document.getElementById("tutorial-text");
const nextBtn = document.getElementById("next-tutorial");
const skipBtn = document.getElementById("skip-tutorial");

function startTutorial() {
  // Check if tutorial was previously skipped
  if (localStorage.getItem("tutorialSkipped") === "true") {
    return; // Don’t start if skipped before
  }
  tutorialOverlay.style.display = "flex";
  showTutorialStep(currentStep);
}

function showTutorialStep(step) {
  const stepData = tutorialSteps[step];
  tutorialTitle.textContent = stepData.title;
  tutorialText.textContent = stepData.text;

  // Remove previous highlight
  document.querySelectorAll(".highlight").forEach((el) => {
    el.classList.remove("highlight");
  });

  // Highlight current element
  if (stepData.element) {
    const element = document.querySelector(stepData.element);
    if (element) {
      element.classList.add("highlight");
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }
}

function endTutorial() {
  tutorialOverlay.style.display = "none";
  document.querySelectorAll(".highlight").forEach((el) => {
    el.classList.remove("highlight");
  });
  closeVolunteerModal(); // Close modal if open
}

nextBtn.addEventListener("click", () => {
  currentStep++;
  if (currentStep < tutorialSteps.length) {
    showTutorialStep(currentStep);
  } else {
    endTutorial();
  }
});

skipBtn.addEventListener("click", () => {
  localStorage.setItem("tutorialSkipped", "true"); // Store skip preference
  endTutorial();
});

// Fetch and Display Pandemic Data (unchanged)
async function fetchPandemicData(country = "global") {
  try {
    const url =
      country === "global"
        ? "https://disease.sh/v3/covid-19/all"
        : `https://disease.sh/v3/covid-19/countries/${country}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch data");
    const data = await response.json();

    const activeCases = document.getElementById("active-cases");
    const recovered = document.getElementById("recovered");
    const deaths = document.getElementById("deaths");
    const vaccinated = document.getElementById("vaccinated");
    const countryName = document.getElementById("country-name");
    const flagImg = document.getElementById("country-flag");

    if (
      !activeCases ||
      !recovered ||
      !deaths ||
      !vaccinated ||
      !countryName ||
      !flagImg
    ) {
      throw new Error("One or more stat elements not found");
    }

    activeCases.textContent = data.active.toLocaleString();
    recovered.textContent = data.recovered.toLocaleString();
    deaths.textContent = data.deaths.toLocaleString();
    vaccinated.textContent = data.tests.toLocaleString();
    countryName.textContent = country === "global" ? "Global" : data.country;

    if (country !== "global" && data.countryInfo && data.countryInfo.flag) {
      flagImg.src = data.countryInfo.flag;
      flagImg.classList.remove("hidden");
    } else {
      flagImg.classList.add("hidden");
    }

    renderPieChart(data.active, data.recovered, data.deaths, data.tests);
  } catch (error) {
    console.error("Error fetching pandemic data:", error);
    console.log("Failed to load pandemic data.");
  }
}

// Fetch and Display Historical Data (unchanged)
async function fetchHistoricalData(country = "global") {
  try {
    const url =
      country === "global"
        ? "https://disease.sh/v3/covid-19/historical/all?lastdays=900"
        : `https://disease.sh/v3/covid-19/historical/${country}?lastdays=900`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch historical data");
    const data = await response.json();
    const timeline = country === "global" ? data : data.timeline;

    const dates = Object.keys(timeline.cases);
    const cases = Object.values(timeline.cases);
    const deaths = Object.values(timeline.deaths);
    const recovered = Object.values(timeline.recovered);

    renderChart(dates, cases, deaths, recovered, country);
  } catch (error) {
    console.error("Error fetching historical data:", error);
    console.log("Failed to load historical data.");
  }
}

// Optimized Chart Rendering (unchanged)
function renderChart(dates, cases, deaths, recovered, country) {
  const chartElement = document.getElementById("infectionRateChart");
  if (!chartElement) {
    console.error("Chart element #infectionRateChart not found");
    return;
  }
  const ctx = chartElement.getContext("2d");
  if (historicalChartInstance) historicalChartInstance.destroy();

  historicalChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: dates,
      datasets: [
        {
          label: "Cases",
          data: cases,
          borderColor: "#00ffff",
          fill: false,
          tension: 0.3,
        },
        {
          label: "Deaths",
          data: deaths,
          borderColor: "#ff5555",
          fill: false,
          tension: 0.3,
        },
        {
          label: "Recovered",
          data: recovered,
          borderColor: "#00ff00",
          fill: false,
          tension: 0.3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { maxTicksLimit: 20 } },
        y: { beginAtZero: true },
      },
      plugins: {
        title: {
          display: true,
          text: `COVID-19 Trends for ${country}`,
          font: { size: 18 },
          color: "black",
        },
        legend: { labels: { color: "black" } },
      },
      elements: { line: { borderWidth: 2 } },
    },
  });
}

function renderPieChart(active, recovered, deaths, vaccinated) {
  const chartElement = document.getElementById("resourceAvailabilityChart");
  if (!chartElement) {
    console.error("Chart element #resourceAvailabilityChart not found");
    return;
  }
  const ctx = chartElement.getContext("2d");
  if (pieChartInstance) pieChartInstance.destroy();

  pieChartInstance = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Active Cases", "Recovered", "Deaths", "Vaccinated"],
      datasets: [
        {
          data: [active, recovered, deaths, vaccinated],
          backgroundColor: ["#ff9999", "#2ecc71", "#e74c3c", "#9b59b6"],
          borderColor: "#000",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "COVID-19 Distribution",
          font: { size: 18 },
          color: "black",
        },
        legend: { labels: { color: "black" } },
      },
    },
  });
}

// Populate Country Dropdown (unchanged)
async function populateCountryDropdown() {
  try {
    const response = await fetch("https://disease.sh/v3/covid-19/countries");
    if (!response.ok) throw new Error("Failed to fetch countries");
    const countries = await response.json();
    const select = document.getElementById("country-select");

    if (!select) {
      console.error("Element #country-select not found");
      return;
    }

    countries.forEach((country) => {
      const option = document.createElement("option");
      option.value = country.country;
      option.textContent = country.country;
      select.appendChild(option);
    });
  } catch (error) {
    console.error("Error populating dropdown:", error);
    console.log("Failed to load country list.");
  }
}

// Volunteer Modal Functions (unchanged)
function openVolunteerModal() {
  const modal = document.getElementById("volunteer-modal");
  if (modal) {
    modal.style.display = "flex";
    showTab("individual");
    fetchOrganizations();
  } else {
    console.error("Volunteer modal not found");
  }
}

function closeVolunteerModal() {
  const modal = document.getElementById("volunteer-modal");
  if (modal) {
    modal.style.display = "none";
    resetForms();
  }
}

function showTab(tabId) {
  const tabs = document.querySelectorAll(".tab-btn");
  const forms = document.querySelectorAll(".volunteer-form");
  const tabButton = document.querySelector(`[onclick="showTab('${tabId}')"]`);
  const form = document.getElementById(`${tabId}-form`);

  if (!tabButton || !form) {
    console.error(`Tab or form for ${tabId} not found`);
    return;
  }

  tabs.forEach((btn) => btn.classList.remove("active"));
  forms.forEach((f) => f.classList.remove("active"));
  tabButton.classList.add("active");
  form.classList.add("active");
  updateProgress(tabId, 1);
}

function updateProgress(formId, step) {
  const progress = document.getElementById("progress");
  if (progress) {
    progress.style.width = step === 1 ? "50%" : "100%";
  }
}

function nextStep(formId, step) {
  const currentStep = document.querySelector(
    `#${formId}-form .form-step[data-step="${step - 1}"]`
  );
  const nextStep = document.querySelector(
    `#${formId}-form .form-step[data-step="${step}"]`
  );
  if (currentStep && nextStep) {
    currentStep.classList.add("hidden");
    nextStep.classList.remove("hidden");
    updateProgress(formId, step);
  }
}

function prevStep(formId, step) {
  const currentStep = document.querySelector(
    `#${formId}-form .form-step[data-step="${step + 1}"]`
  );
  const prevStep = document.querySelector(
    `#${formId}-form .form-step[data-step="${step}"]`
  );
  if (currentStep && prevStep) {
    currentStep.classList.add("hidden");
    prevStep.classList.remove("hidden");
    updateProgress(formId, step);
  }
}

function resetForms() {
  const forms = document.querySelectorAll(".volunteer-form");
  forms.forEach((form) => {
    if (form) {
      form.reset();
      form
        .querySelectorAll(".form-step")
        .forEach((step) => step.classList.add("hidden"));
      const firstStep = form.querySelector(".form-step[data-step='1']");
      if (firstStep) firstStep.classList.remove("hidden");
    }
  });
  const progress = document.getElementById("progress");
  if (progress) progress.style.width = "50%";
}

async function fetchOrganizations() {
  try {
    const response = await fetch("http://localhost:5000/api/organizations");
    if (!response.ok) throw new Error("Failed to fetch organizations");
    const orgs = await response.json();
    const orgList = document.getElementById("org-list");

    if (!orgList) {
      console.error("Element #org-list not found");
      return;
    }

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
  } catch (err) {
    console.error("Error fetching organizations:", err);
    showPopupMessage("Failed to load organizations.");
  }
}

// Form Submissions (unchanged)
async function submitVolunteer(data) {
  const token = localStorage.getItem("token");
  if (!token) {
    showPopupMessage("Please log in to proceed.");
    window.location.href = "/login";
    return;
  }
  try {
    const response = await fetch("http://localhost:5000/api/volunteer/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const text = await response.text();
      console.error("Server response:", text);
      throw new Error(`Server error: ${response.status}`);
    }
    const result = await response.json();
    showPopupMessage("Volunteer signup successful!");
    closeVolunteerModal();
  } catch (err) {
    console.error("Error submitting volunteer data:", err);
    showPopupMessage("Error during signup: " + err.message);
  }
}

// Event Listeners and Initialization
document.addEventListener("DOMContentLoaded", async () => {
  // Start tutorial on page load if not skipped
  startTutorial();

  // Observe sections for navbar highlighting
  document.querySelectorAll("section").forEach((section) => {
    if (section) observer.observe(section);
  });

  // Stats initialization
  await populateCountryDropdown();
  fetchPandemicData("India");
  fetchHistoricalData("India");

  // Add form listeners with null checks
  const individualForm = document.getElementById("individual-form");
  if (individualForm) {
    individualForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = {
        name: document.getElementById("ind-name")?.value || "",
        email: document.getElementById("ind-email")?.value || "",
        phone:
          (document.getElementById("ind-country-code")?.value || "") +
          (document.getElementById("ind-phone")?.value || ""),
        skills: document.getElementById("ind-skills")?.value || "",
        type: "individual",
      };
      await submitVolunteer(data);
    });
  } else {
    console.error("Element #individual-form not found");
  }

  const createOrgForm = document.getElementById("create-org-form");
  if (createOrgForm) {
    createOrgForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = {
        name: document.getElementById("org-name")?.value || "",
        email: document.getElementById("org-email")?.value || "",
        location: document.getElementById("org-location")?.value || "",
        description: document.getElementById("org-description")?.value || "",
        type: "create-org",
      };
      await submitVolunteer(data);
    });
  }

  const joinOrgForm = document.getElementById("join-org-form");
  if (joinOrgForm) {
    joinOrgForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const selectedOrg = document.querySelector(".org-item.selected");
      if (!selectedOrg) {
        showPopupMessage("Please select an organization.");
        return;
      }
      const data = {
        name: document.getElementById("join-name")?.value || "",
        email: document.getElementById("join-email")?.value || "",
        orgId: selectedOrg.dataset.orgId,
        type: "join-org",
      };
      await submitVolunteer(data);
    });
  }

  const countrySelect = document.getElementById("country-select");
  if (countrySelect) {
    countrySelect.addEventListener("change", (event) => {
      const selectedCountry = event.target.value || "global";
      fetchPandemicData(selectedCountry);
      fetchHistoricalData(selectedCountry);
    });
  } else {
    console.error("Element #country-select not found");
  }

  // ScrollReveal animations (unchanged)
  if (typeof ScrollReveal !== "undefined") {
    ScrollReveal().reveal(".stat-card", {
      delay: 200,
      distance: "50px",
      origin: "bottom",
      interval: 100,
    });
    ScrollReveal().reveal(".chart-container", {
      delay: 200,
      distance: "50px",
      origin: "bottom",
      interval: 100,
    });
    ScrollReveal().reveal(".card", {
      delay: 200,
      distance: "50px",
      origin: "bottom",
      interval: 100,
    });
    ScrollReveal().reveal(".faq-item", {
      delay: 200,
      distance: "50px",
      origin: "bottom",
      interval: 100,
    });
  }
});

if (window.location.pathname === "/organizations") {
  loadOrganizations();
  const orgFilter = document.getElementById("org-filter");
  const categoryFilter = document.getElementById("category-filter");
  const locationFilter = document.getElementById("location-filter");
  if (orgFilter) orgFilter.addEventListener("input", filterOrganizations);
  if (categoryFilter)
    categoryFilter.addEventListener("change", filterOrganizations);
  if (locationFilter)
    locationFilter.addEventListener("change", filterOrganizations);
}

// Org Dashboard for /org-dashboard
if (window.location.pathname === "/org-dashboard") {
  loadOrgDashboard();
  const eventForm = document.getElementById("event-form");
  const orgProfileForm = document.getElementById("org-profile-form");
  if (eventForm) eventForm.addEventListener("submit", handleEventFormSubmit);
  if (orgProfileForm)
    orgProfileForm.addEventListener("submit", handleOrgProfileSubmit);
}

// User Dashboard for /user-dashboard
if (window.location.pathname === "/user-dashboard") {
  loadUserDashboard();
}

// Org Listing Functions
async function loadOrganizations() {
  try {
    const response = await fetch("http://localhost:5000/api/organizations");
    if (!response.ok) throw new Error("Failed to fetch organizations");
    const orgs = await response.json();
    const grid = document.getElementById("org-grid");
    const locationFilter = document.getElementById("location-filter");

    if (!grid || !locationFilter) {
      console.error("Org grid or location filter not found");
      return;
    }

    grid.innerHTML = "";
    const locations = new Set(["All Locations"]);
    orgs.forEach((org) => {
      const card = document.createElement("div");
      card.className = "org-card";
      card.innerHTML = `
  <img src="${org.logo || "/default-org.png"}" alt="${org.name}">
  <h3>${org.name}</h3>
  <p>${org.description.substring(0, 100)}...</p>
  <p><i class="fa-solid fa-map-marker-alt"></i> ${org.location}</p>
  <p><i class="fa-solid fa-users"></i> Volunteers Needed: ${
    org.volunteerRequirements
  }</p>
  <button class="join-btn" onclick="joinOrganization('${
    org._id
  }')">Join</button>
`;
      grid.appendChild(card);
      locations.add(org.location);
    });

    locations.forEach((loc) => {
      const option = document.createElement("option");
      option.value = loc === "All Locations" ? "" : loc;
      option.textContent = loc;
      locationFilter.appendChild(option);
    });

    filterOrganizations();
  } catch (err) {
    console.error("Error loading organizations:", err);
    console.log("Failed to load organizations.");
  }
}

function filterOrganizations() {
  const search =
    document.getElementById("org-filter")?.value.toLowerCase() || "";
  const category = document.getElementById("category-filter")?.value || "";
  const location = document.getElementById("location-filter")?.value || "";
  const cards = document.querySelectorAll(".org-card");

  cards.forEach((card) => {
    const name = card.querySelector("h3").textContent.toLowerCase();
    const loc = card.querySelector("p:nth-child(4)").textContent.split(": ")[1];
    const matchesSearch = name.includes(search);
    const matchesCategory = !category || card.dataset.category === category;
    const matchesLocation = !location || loc === location;
    card.style.display =
      matchesSearch && matchesCategory && matchesLocation ? "block" : "none";
  });
}

async function joinOrganization(orgId) {
  const token = localStorage.getItem("token");
  if (!token) {
    showPopupMessage("Please log in to join an organization.");
    return;
  }

  const name = prompt("Enter your full name:") || "";
  const email = prompt("Enter your email:") || "";
  if (!name || !email) return;

  try {
    const response = await fetch("http://localhost:5000/api/volunteer/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({ name, email, orgId, type: "join-org" }),
    });
    if (!response.ok) throw new Error("Failed to join organization");
    showPopupMessage("Successfully requested to join!");
  } catch (err) {
    console.error("Error joining organization:", err);
    showPopupMessage("Error during join request.");
  }
}
document.addEventListener("DOMContentLoaded", () => {
  loadOrgDashboard();
});
// Org Dashboard Functions
async function loadOrgDashboard() {
  const token = localStorage.getItem("token");
  if (!token) {
    showPopupMessage("Please log in to access the dashboard.");
    window.location.href = "/login";
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/api/org/dashboard", {
      headers: { Authorization: token },
    });
    // if (!response.ok) throw new Error("Failed to load dashboard");
    const data = await response.json();

    const volunteerCount = document.getElementById("volunteer-count");
    const projectCount = document.getElementById("project-count");
    const beneficiaryCount = document.getElementById("beneficiary-count");
    const volunteerList = document.getElementById("volunteer-list");
    const eventList = document.getElementById("event-list");
    const stories = document.getElementById("stories");
    const orgBio = document.getElementById("org-bio");

    if (volunteerCount) volunteerCount.textContent = data.volunteers.length;
    if (projectCount) projectCount.textContent = data.projects.length;
    if (beneficiaryCount) beneficiaryCount.textContent = data.beneficiaries;

    if (volunteerList) {
      volunteerList.innerHTML = "";
      data.volunteers.forEach((vol) => {
        const div = document.createElement("div");
        div.className = "volunteer-item";
        div.innerHTML = `
    <p>${vol.name} (${vol.email}) - Status: ${vol.status}</p>
    <div class="action-btns">
      ${
        vol.status === "pending"
          ? `
        <button class="action-btn" onclick="manageVolunteer('${vol._id}', 'accept')">Accept</button>
        <button class="action-btn" onclick="manageVolunteer('${vol._id}', 'reject')">Reject</button>
      `
          : `<button class="action-btn" onclick="assignTask('${vol._id}')">Assign Task</button>`
      }
    </div>
  `;
        volunteerList.appendChild(div);
      });
    }

    if (eventList) {
      eventList.innerHTML = "";
      data.projects.forEach((proj) => {
        const div = document.createElement("div");
        div.className = "event-item";
        div.innerHTML = `
    <p>${proj.name} - ${new Date(proj.date).toLocaleString()}</p>
    <p>Funds: $${proj.fundsRaised}</p>
  `;
        eventList.appendChild(div);
      });
    }

    if (stories) stories.innerHTML = "<p>No impact stories yet.</p>";
    if (orgBio) orgBio.value = data.org.description || "";
  } catch (err) {
    console.error("Error loading dashboard:", err);
    showPopupMessage("Failed to load dashboard.");
  }
}

async function manageVolunteer(volunteerId, action) {
  const token = localStorage.getItem("token");
  try {
    const response = await fetch(
      `http://localhost:5000/api/org/volunteer/${action}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ volunteerId }),
      }
    );
    if (!response.ok) throw new Error("Failed to manage volunteer");
    showPopupMessage(`Volunteer ${action}ed successfully!`);
    loadOrgDashboard();
  } catch (err) {
    showPopupMessage("Error managing volunteer.");
  }
}

async function assignTask(volunteerId) {
  const token = localStorage.getItem("token");
  const task = prompt("Enter task description:") || "";
  if (!task) return;

  try {
    const response = await fetch(
      "http://localhost:5000/api/org/volunteer/task",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ volunteerId, task }),
      }
    );
    if (!response.ok) throw new Error("Failed to assign task");
    showPopupMessage("Task assigned successfully!");
    if (window.location.pathname === "/user-dashboard") {
      loadUserDashboard();
    }
  } catch (err) {
    showPopupMessage("Error assigning task.");
  }
}

function openEventModal() {
  const modal = document.getElementById("event-modal");
  if (modal) modal.style.display = "flex";
}

function closeEventModal() {
  const modal = document.getElementById("event-modal");
  if (modal) {
    modal.style.display = "none";
    const form = document.getElementById("event-form");
    if (form) form.reset();
  }
}

async function handleEventFormSubmit(e) {
  e.preventDefault();
  const token = localStorage.getItem("token");
  const data = {
    name: document.getElementById("event-name")?.value || "",
    description: document.getElementById("event-description")?.value || "",
    date: document.getElementById("event-date")?.value || "",
  };

  try {
    const response = await fetch("http://localhost:5000/api/org/event", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create event");
    showPopupMessage("Event created successfully!");
    closeEventModal();
    loadOrgDashboard();
  } catch (err) {
    showPopupMessage("Error creating event.");
  }
}

async function handleOrgProfileSubmit(e) {
  e.preventDefault();
  const token = localStorage.getItem("token");
  const formData = new FormData();
  formData.append(
    "description",
    document.getElementById("org-bio")?.value || ""
  );
  if (document.getElementById("org-cover")?.files[0]) {
    formData.append("cover", document.getElementById("org-cover").files[0]);
  }
  if (document.getElementById("org-logo")?.files[0]) {
    formData.append("logo", document.getElementById("org-logo").files[0]);
  }

  try {
    const response = await fetch("http://localhost:5000/api/org/profile", {
      method: "POST",
      headers: { Authorization: token },
      body: formData,
    });
    if (!response.ok) throw new Error("Failed to update profile");
    showPopupMessage("Profile updated successfully!");
    loadOrgDashboard();
  } catch (err) {
    showPopupMessage("Error updating profile.");
  }
}
document.addEventListener("DOMContentLoaded", () => {
  loadUserDashboard();
});
// User Dashboard Functions
async function loadUserDashboard() {
  const token = localStorage.getItem("token");
  if (!token) {
    showPopupMessage("Please log in to access the dashboard.");
    window.location.href = "/login";
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/api/user/dashboard", {
      headers: { Authorization: token },
    });
    // if (!response.ok) throw new Error("Failed to load dashboard");
    const data = await response.json();

    const joinedOrgs = document.getElementById("joined-orgs");
    const volunteerHours = document.getElementById("volunteer-hours");
    const impactContrib = document.getElementById("impact-contrib");
    const joinedList = document.getElementById("joined-org-list");
    const pendingList = document.getElementById("pending-org-list");
    const recommendedOrgs = document.getElementById("recommended-orgs");

    if (joinedOrgs) joinedOrgs.textContent = data.joinedOrgs.length;
    if (volunteerHours) volunteerHours.textContent = data.volunteerHours || 0;
    if (impactContrib)
      impactContrib.textContent = data.impactContributions || 0;

    if (joinedList) {
      joinedList.innerHTML = "";
      data.joinedOrgs.forEach((org) => {
        const div = document.createElement("div");
        div.className = "org-item";
        let taskList = "<ul>";
        org.tasks.forEach((task) => {
          taskList += `<li>${task.description} (Assigned: ${new Date(
            task.assignedAt
          ).toLocaleString()})</li>`;
        });
        taskList += "</ul>";
        div.innerHTML = `
    <p>${org.name} - ${org.tasks.length} Tasks Assigned</p>
    ${org.tasks.length > 0 ? taskList : "<p>No tasks assigned yet.</p>"}
  `;
        joinedList.appendChild(div);
      });
    }

    if (pendingList) {
      pendingList.innerHTML = "";
      data.pendingOrgs.forEach((org) => {
        const div = document.createElement("div");
        div.className = "org-item";
        div.innerHTML = `<p>${org.name} - Pending Approval</p>`;
        pendingList.appendChild(div);
      });
    }

    if (recommendedOrgs) {
      recommendedOrgs.innerHTML = "";
      data.recommendations.forEach((org) => {
        const card = document.createElement("div");
        card.className = "org-card";
        card.innerHTML = `
    <img src="${org.logo || "/default-org.png"}" alt="${org.name}">
    <h3>${org.name}</h3>
    <p>${org.description.substring(0, 100)}...</p>
    <button class="join-btn" onclick="joinOrganization('${
      org._id
    }')">Join</button>
  `;
        recommendedOrgs.appendChild(card);
      });
    }
  } catch (err) {
    console.error("Error loading dashboard:", err);
    showPopupMessage("Failed to load dashboard.");
  }
}
