let currentOrgId = null;
let page = 1;
const orgsPerPage = 6;

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

// Organization Details Modal
function showDetailsModal(org) {
  currentOrgId = org._id;
  document.getElementById("org-details-name").textContent = org.name;
  document.getElementById("org-details-category").textContent = `Category: ${
    org.category || "Organization"
  }`;
  document.getElementById(
    "org-details-location"
  ).textContent = `Location: ${org.location}`;
  document.getElementById("org-details-description").textContent =
    org.description;
  document.getElementById("org-details-modal").style.display = "flex";
}

function closeDetailsModal() {
  document.getElementById("org-details-modal").style.display = "none";
  currentOrgId = null;
}

function joinFromDetails() {
  if (currentOrgId) joinOrganization(currentOrgId);
  closeDetailsModal();
}

function contactFromDetails() {
  if (currentOrgId) contactOrganization(currentOrgId);
  closeDetailsModal();
}

// Fetch and Display Organizations
async function fetchOrganizations(append = false) {
  try {
    const response = await fetch(
      `http://localhost:5000/api/organizations?page=${page}&limit=${orgsPerPage}`
    );
    const orgs = await response.json();
    const orgGrid = document.getElementById("org-grid");
    const locationFilter = document.getElementById("location-filter");
    const featuredGrid = document.getElementById("featured-grid");

    if (!append) orgGrid.innerHTML = "";
    const locations = new Set();

    orgs.forEach((org, index) => {
      const card = document.createElement("div");
      card.className = "org-card";
      card.innerHTML = `
              <h3>${org.name}</h3>
              <p><i class="fa-solid fa-building"></i> ${
                org.category || "Organization"
              }</p>
              <p><i class="fa-solid fa-map-marker-alt"></i> ${org.location}</p>
              <p class="rating"><i class="fa-solid fa-star"></i> Rating: ${
                org.rating || "N/A"
              }</p>
              <p><i class="fa-solid fa-users"></i> Volunteers: ${
                org.volunteerCount || 0
              }</p>
              <p>${org.description.slice(0, 100)}...</p>
              <div class="btn-group">
                <button class="join-btn" onclick="joinOrganization('${
                  org._id
                }')">Join Now</button>
                <button class="contact-btn" onclick="contactOrganization('${
                  org._id
                }')">Contact</button>
              </div>
            `;
      card.onclick = (e) => {
        if (
          !e.target.classList.contains("join-btn") &&
          !e.target.classList.contains("contact-btn")
        ) {
          showDetailsModal(org);
        }
      };
      orgGrid.appendChild(card);
      locations.add(org.location);

      // Featured Organizations (first 3 as example)
      if (index < 3 && !append) {
        const featuredCard = document.createElement("div");
        featuredCard.className = "featured-card";
        featuredCard.innerHTML = `<h3>${org.name}</h3><p>${org.location}</p>`;
        featuredGrid.appendChild(featuredCard);
      }
    });

    locations.forEach((loc) => {
      if (!locationFilter.querySelector(`option[value="${loc}"]`)) {
        const option = document.createElement("option");
        option.value = loc;
        option.textContent = loc;
        locationFilter.appendChild(option);
      }
    });

    ScrollReveal().reveal(".org-card", {
      delay: 200,
      distance: "50px",
      origin: "bottom",
      interval: 100,
    });
    ScrollReveal().reveal(".featured-card", {
      delay: 200,
      distance: "50px",
      origin: "left",
      interval: 100,
    });

    document.getElementById("load-more").style.display =
      orgs.length < orgsPerPage ? "none" : "block";
  } catch (error) {
    console.error("Error fetching organizations:", error);
    showPopupMessage("Failed to load organizations.");
  }
}

// Load More
document.getElementById("load-more").addEventListener("click", () => {
  page++;
  fetchOrganizations(true);
});

// Filter Organizations
function filterOrganizations() {
  const search = document.getElementById("org-filter").value.toLowerCase();
  const category = document.getElementById("category-filter").value;
  const location = document.getElementById("location-filter").value;
  const cards = document.querySelectorAll(".org-card");

  cards.forEach((card) => {
    const name = card.querySelector("h3").textContent.toLowerCase();
    const cat = card.querySelector("p:nth-child(2)").textContent.toLowerCase();
    const loc = card.querySelector("p:nth-child(3)").textContent.toLowerCase();

    const matchesSearch = name.includes(search);
    const matchesCategory = !category || cat.includes(category.toLowerCase());
    const matchesLocation = !location || loc.includes(location.toLowerCase());

    card.style.display =
      matchesSearch && matchesCategory && matchesLocation ? "block" : "none";
  });
}

// Sort Organizations
function sortOrganizations() {
  const sortBy = document.getElementById("sort-filter").value;
  const orgGrid = document.getElementById("org-grid");
  const cards = Array.from(document.querySelectorAll(".org-card"));
  cards.sort((a, b) => {
    if (sortBy === "name")
      return a
        .querySelector("h3")
        .textContent.localeCompare(b.querySelector("h3").textContent);
    if (sortBy === "location")
      return a
        .querySelector("p:nth-child(3)")
        .textContent.localeCompare(
          b.querySelector("p:nth-child(3)").textContent
        );
    if (sortBy === "popularity")
      return (
        (b.querySelector("p:nth-child(5)").textContent.match(/\d+/) || 0) -
        (a.querySelector("p:nth-child(5)").textContent.match(/\d+/) || 0)
      );
  });
  cards.forEach((card) => orgGrid.appendChild(card));
}

// Join Organization
async function joinOrganization(orgId) {
  const token = localStorage.getItem("token");
  if (!token) {
    showPopupMessage("Please log in to join an organization.");
    window.location.href = "/login";
    return;
  }
  try {
    const response = await fetch(
      "http://localhost:5000/api/volunteer/join-org",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ orgId }),
      }
    );
    if (!response.ok) throw new Error("Failed to join organization");
    showPopupMessage("Successfully requested to join the organization!");
  } catch (error) {
    console.error("Error joining organization:", error);
    showPopupMessage("Error joining organization.");
  }
}

// Contact Organization (Placeholder)
async function contactOrganization(orgId) {
  showPopupMessage(
    `Contacting organization ${orgId}... (Feature under development)`
  );
  // Implement actual contact logic here (e.g., open a form or send an email)
}

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
    console.error("Error fetching organizations for join:", error);
    showPopupMessage("Failed to load organizations for joining.");
  }
}

// Form Submissions
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
    if (!response.ok) throw new Error("Failed to submit volunteer data");
    showPopupMessage("Volunteer signup successful!");
    closeVolunteerModal();
  } catch (error) {
    console.error("Error submitting volunteer data:", error);
    showPopupMessage("Error during signup.");
  }
}

// Tutorial System (Updated without Map)
const tutorialSteps = [
  {
    title: "Welcome!",
    text: "Explore volunteer organizations here.",
    element: "#listing",
  },
  {
    title: "Featured",
    text: "Check out top organizations in this section.",
    element: ".featured-orgs",
  },
  {
    title: "Filters",
    text: "Use these to find organizations by name, category, or location.",
    element: ".filters",
  },
  {
    title: "Join",
    text: "Click 'Join Now' to get involved!",
    element: ".org-card .join-btn",
  },
  {
    title: "Contact",
    text: "Reach out to an organization with this button.",
    element: ".org-card .contact-btn",
  },
  {
    title: "All Set!",
    text: "You’re ready to explore and join organizations!",
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
  if (localStorage.getItem("orgTutorialSkipped") === "true") return;
  tutorialOverlay.style.display = "flex";
  showTutorialStep(currentStep);
}

function showTutorialStep(step) {
  const stepData = tutorialSteps[step];
  tutorialTitle.textContent = stepData.title;
  tutorialText.textContent = stepData.text;

  document
    .querySelectorAll(".highlight")
    .forEach((el) => el.classList.remove("highlight"));
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
  document
    .querySelectorAll(".highlight")
    .forEach((el) => el.classList.remove("highlight"));
}

nextBtn.addEventListener("click", () => {
  currentStep++;
  if (currentStep < tutorialSteps.length) showTutorialStep(currentStep);
  else endTutorial();
});

skipBtn.addEventListener("click", () => {
  localStorage.setItem("orgTutorialSkipped", "true");
  endTutorial();
});

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  fetchOrganizations();
  startTutorial();

  document
    .getElementById("org-filter")
    .addEventListener("input", filterOrganizations);
  document
    .getElementById("category-filter")
    .addEventListener("change", filterOrganizations);
  document
    .getElementById("location-filter")
    .addEventListener("change", filterOrganizations);
  document
    .getElementById("sort-filter")
    .addEventListener("change", sortOrganizations);

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
});
