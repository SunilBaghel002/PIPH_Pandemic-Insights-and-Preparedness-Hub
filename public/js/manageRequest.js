// Global variables
const resources = {
    food: [
      {
        id: "rice",
        name: "Rice (5kg)",
        price: 10,
        category: "food",
        description: "Premium quality white rice",
        stock: 50,
      },
      {
        id: "wheat",
        name: "Wheat Flour (5kg)",
        price: 10,
        category: "food",
        description: "Whole wheat atta for chapatis",
        stock: 45,
      },
      {
        id: "dal",
        name: "Yellow Dal (1kg)",
        price: 5,
        category: "food",
        description: "Toor/Arhar dal, high protein",
        stock: 60,
      },
      {
        id: "oil",
        name: "Cooking Oil (1L)",
        price: 10,
        category: "food",
        description: "Refined vegetable oil",
        stock: 40,
      },
      {
        id: "sugar",
        name: "Sugar (1kg)",
        price: 5,
        category: "food",
        description: "Fine grain white sugar",
        stock: 55,
      },
      {
        id: "salt",
        name: "Salt (1kg)",
        price: 5,
        category: "food",
        description: "Iodized table salt",
        stock: 70,
      },
      {
        id: "tea",
        name: "Tea Leaves (250g)",
        price: 5,
        category: "food",
        description: "Premium black tea leaves",
        stock: 45,
      },
      {
        id: "milk",
        name: "Milk Powder (500g)",
        price: 10,
        category: "food",
        description: "Full cream milk powder",
        stock: 35,
      },
    ],
    medicine: [
      {
        id: "paracetamol",
        name: "Paracetamol (10 tabs)",
        price: 5,
        category: "medicine",
        description: "Fever & pain relief tablets",
        stock: 80,
      },
      {
        id: "oRS",
        name: "ORS Packets (10)",
        price: 5,
        category: "medicine",
        description: "Oral rehydration salts",
        stock: 65,
      },
      {
        id: "vitaminC",
        name: "Vitamin C (30 tabs)",
        price: 10,
        category: "medicine",
        description: "Immunity booster supplements",
        stock: 50,
      },
      {
        id: "antiseptic",
        name: "Antiseptic Solution",
        price: 10,
        category: "medicine",
        description: "For cleaning wounds & cuts",
        stock: 55,
      },
      {
        id: "bandage",
        name: "Bandages (Pack)",
        price: 5,
        category: "medicine",
        description: "Sterile adhesive bandages",
        stock: 60,
      },
      {
        id: "coughSyrup",
        name: "Cough Syrup (100ml)",
        price: 10,
        category: "medicine",
        description: "For dry & wet cough relief",
        stock: 40,
      },
    ],
    essentials: [
      {
        id: "sanitizer",
        name: "Hand Sanitizer (100ml)",
        price: 5,
        category: "essentials",
        description: "70% alcohol-based sanitizer",
        stock: 65,
      },
      {
        id: "mask",
        name: "Face Masks (10pc)",
        price: 5,
        category: "essentials",
        description: "3-ply disposable face masks",
        stock: 75,
      },
      {
        id: "soap",
        name: "Soap Bars (4pc)",
        price: 10,
        category: "essentials",
        description: "Antibacterial bathing soap",
        stock: 60,
      },
      {
        id: "detergent",
        name: "Detergent (500g)",
        price: 10,
        category: "essentials",
        description: "Washing powder for clothes",
        stock: 50,
      },
      {
        id: "candles",
        name: "Candles (Pack of 6)",
        price: 5,
        category: "essentials",
        description: "Emergency lighting solution",
        stock: 70,
      },
      {
        id: "toothpaste",
        name: "Toothpaste (100g)",
        price: 5,
        category: "essentials",
        description: "Fluoride toothpaste",
        stock: 55,
      },
      {
        id: "toilet",
        name: "Toilet Paper (4 rolls)",
        price: 10,
        category: "essentials",
        description: "Soft toilet tissue rolls",
        stock: 45,
      },
    ],
  };

  // Combine all resources into a single array
  const allResources = [
    ...resources.food,
    ...resources.medicine,
    ...resources.essentials,
  ];
  let currentRequestId = null;
  // let allResources = [];
  let allRequests = [];
  let selectedResourcesForRequest = [];
  const API_URL = ""; // Base URL - set if needed

  // Check Admin Access with JWT
  async function checkAdminAccess() {
    const token = localStorage.getItem("token");
    const userEmail = localStorage.getItem("email");
    const isAuthorized = localStorage.getItem("isAdminAuthorized");

    if (isAuthorized === "true") {
      console.log("Admin already authorized, skipping check");
      initDashboard();
      return;
    }

    if (!token || !userEmail) {
      console.log(
        "No token or email found in localStorage, redirecting to /login"
      );
      document.getElementById("error-message").innerText =
        "Please log in to access the admin dashboard.";
      setTimeout(() => (window.location.href = "/login"), 2000);
      return;
    }

    try {
      const response = await fetch("/check-email", {
        headers: {
          "x-user-email": userEmail,
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Check-email response:", response.status);

      if (response.status === 200) {
        localStorage.setItem("isAdminAuthorized", "true");
        document.getElementById("error-message").innerText = "";
        initDashboard();
      } else {
        console.log("Access denied, redirecting to /login");
        document.getElementById("error-message").innerText =
          "Access denied. Redirecting to login...";
        localStorage.removeItem("isAdminAuthorized");
        setTimeout(() => (window.location.href = "/login"), 2000);
      }
    } catch (error) {
      console.error("Error checking access:", error);
      document.getElementById("error-message").innerText =
        "Server error. Please try again later.";
    }
  }

  // Initialize Dashboard
  function initDashboard() {
    fetchResources();
    fetchDonations();
    fetchRequests();
    fetchStats();
    setupEventListeners();
    initializeParticles();
  }

  // Initialize particles.js
  function initializeParticles() {
    particlesJS("particles-js", {
      particles: {
        number: { value: 30, density: { enable: true, value_area: 800 } },
        color: { value: "#4361ee" },
        opacity: { value: 0.1, random: true },
        size: { value: 3, random: true },
        line_linked: {
          enable: true,
          distance: 150,
          color: "#4361ee",
          opacity: 0.1,
          width: 1,
        },
        move: {
          enable: true,
          speed: 1,
          direction: "none",
          random: true,
          out_mode: "out",
        },
      },
      interactivity: {
        detect_on: "canvas",
        events: { onhover: { enable: true, mode: "grab" } },
      },
    });
  }

  // Setup Event Listeners
  function setupEventListeners() {
    // Update Resource Form
    document
      .getElementById("update-resource-form")
      .addEventListener("submit", function (event) {
        event.preventDefault();
        updateResource();
      });

    // Add Resource Form
    document
      .getElementById("add-resource-form")
      .addEventListener("submit", function (event) {
        event.preventDefault();
        addResource();
      });

    // Add Request Form
    document
      .getElementById("add-request-form")
      .addEventListener("submit", function (event) {
        event.preventDefault();
        addRequest();
      });
  }

  // Fetch Stats
  async function fetchStats() {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/admin/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const stats = await response.json();

      // Update stats on dashboard
      document.getElementById("stats-total-requests").textContent =
        stats.requests.total || 0;
      document.getElementById("stats-pending-requests").textContent =
        stats.requests.pending || 0;
      document.getElementById("stats-approved-requests").textContent =
        stats.requests.approved || 0;

      // Count resource categories
      const resourceCount =
        stats.resources.food +
        stats.resources.medicine +
        stats.resources.essentials;
      document.getElementById("stats-total-resources").textContent =
        resourceCount || 0;
    } catch (error) {
      console.error("Error fetching stats:", error);
      showToast("Error loading dashboard statistics", "error");
    }
  }

  // Fetch Resources
  async function fetchResources() {
    try {
      const resourcesGrid = document.getElementById("resources-grid");
      resourcesGrid.innerHTML = '<div class="loadingSpinner"></div>';

      const response = await fetch(`${API_URL}/api/resources`);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const resources = await response.json();
      allResources = resources;

      if (resources.length === 0) {
        resourcesGrid.innerHTML = `
          <div class="no-items">
            <i class="fa-solid fa-box-open"></i>
            <p>No resources available</p>
            <button class="action-btn" onclick="openAddResourceModal()">
              <i class="fa-solid fa-plus"></i> Add Resource
            </button>
          </div>
        `;
        return;
      }

      resourcesGrid.innerHTML = resources
        .map(
          (resource) => `
        <div class="resource-card">
          <span class="resource-category category-${resource.category}">${
            resource.category
          }</span>
          <i class="fa-solid fa-${
            resource.category === "food"
              ? "utensils"
              : resource.category === "medicine"
              ? "medkit"
              : "boxes-stacked"
          }"></i>
          <h3>${resource.name}</h3>
          <div class="resource-details">
            <p>Price: ₹${resource.price}</p>
            <p>Available: ${resource.stock} units</p>
            <span class="status ${
              resource.stock > 20
                ? "in-stock"
                : resource.stock > 0
                ? "low-stock"
                : "out-of-stock"
            }">
              ${
                resource.stock > 20
                  ? "In Stock"
                  : resource.stock > 0
                  ? "Low Stock"
                  : "Out of Stock"
              }
            </span>
            <button class="action-btn" onclick="openResourceModal('${
              resource.id
            }')">
              <i class="fa-solid fa-pen"></i> Update
            </button>
          </div>
        </div>
      `
        )
        .join("");

      // Also update resource selection for add request form
      updateResourceSelectionInForm();
    } catch (error) {
      console.error("Error fetching resources:", error);
      document.getElementById("resources-grid").innerHTML = `
        <div class="no-items">
          <i class="fa-solid fa-exclamation-triangle"></i>
          <p>Error loading resources</p>
          <button class="action-btn" onclick="fetchResources()">
            <i class="fa-solid fa-refresh"></i> Try Again
          </button>
        </div>
      `;
    }
  }

  // Update Resource Selection in Add Request Form
  function updateResourceSelectionInForm() {
    const resourceSelection = document.getElementById("resource-selection");

    if (allResources.length === 0) {
      resourceSelection.innerHTML = `
        <p style="color: #718096;">No resources available. Please add resources first.</p>
      `;
      return;
    }

    // Group resources by category for better organization
    const resourcesByCategory = {};
    allResources.forEach((resource) => {
      if (!resourcesByCategory[resource.category]) {
        resourcesByCategory[resource.category] = [];
      }
      resourcesByCategory[resource.category].push(resource);
    });

    // Create resource selection HTML
    let html = "";

    Object.keys(resourcesByCategory).forEach((category) => {
      html += `<h5 style="margin: 15px 0 10px; color: #4a5568; text-transform: capitalize;">${category}</h5>`;
      html += `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; margin-bottom: 15px;">`;

      resourcesByCategory[category].forEach((resource) => {
        html += `
          <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; background: white;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-weight: 500;">${resource.name}</div>
                <div style="font-size: 0.8rem; color: #718096;">₹${resource.price} | ${resource.stock} in stock</div>
              </div>
              <div>
                <input type="number" 
                  min="0" 
                  max="${resource.stock}" 
                  value="0" 
                  style="width: 60px; text-align: center;" 
                  onchange="updateSelectedResources('${resource.id}', this.value)" 
                />
              </div>
            </div>
          </div>
        `;
      });

      html += `</div>`;
    });

    resourceSelection.innerHTML = html;
  }

  // Update Selected Resources for Request
  function updateSelectedResources(resourceId, quantity) {
    quantity = parseInt(quantity);

    // Find resource in allResources
    const resource = allResources.find((r) => r.id === resourceId);

    if (!resource) return;

    // Check if resource is already in selectedResourcesForRequest
    const existingIndex = selectedResourcesForRequest.findIndex(
      (r) => r.id === resourceId
    );

    if (quantity > 0) {
      // Add or update resource in selectedResourcesForRequest
      if (existingIndex >= 0) {
        selectedResourcesForRequest[existingIndex].quantity = quantity;
      } else {
        selectedResourcesForRequest.push({
          id: resource.id,
          name: resource.name,
          price: resource.price,
          quantity: quantity,
          category: resource.category,
        });
      }
    } else if (existingIndex >= 0) {
      // Remove resource from selectedResourcesForRequest
      selectedResourcesForRequest.splice(existingIndex, 1);
    }

    console.log("Selected resources:", selectedResourcesForRequest);
  }

  // Fetch Donations
  async function fetchDonations() {
    try {
      const donationsList = document.getElementById("donations-list");
      donationsList.innerHTML = '<div class="loadingSpinner"></div>';

      // This is a placeholder as the original code mentioned donations but didn't have a clear implementation
      // In a real app, you would fetch from an API endpoint
      setTimeout(() => {
        donationsList.innerHTML = `
          <div class="no-items">
            <i class="fa-solid fa-hand-holding-heart"></i>
            <p>No pending donations available</p>
          </div>
        `;
      }, 500);
    } catch (error) {
      console.error("Error fetching donations:", error);
      document.getElementById("donations-list").innerHTML = `
        <div class="no-items">
          <i class="fa-solid fa-exclamation-triangle"></i>
          <p>Error loading donations</p>
          <button class="action-btn" onclick="fetchDonations()">
            <i class="fa-solid fa-refresh"></i> Try Again
          </button>
        </div>
      `;
    }
  }

  // Refresh Donations
  function refreshDonations() {
    fetchDonations();
    showToast("Donations refreshed successfully", "success");
  }

  // Fetch Requests
  async function fetchRequests() {
    try {
      const requestsTable = document.getElementById("requests-table");
      document.getElementById("requests-loading").style.display = "block";
      document.getElementById("no-requests").style.display = "none";

      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/admin/requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const requests = await response.json();
      allRequests = requests;

      document.getElementById("requests-loading").style.display = "none";

      if (requests.length === 0) {
        document.getElementById("no-requests").style.display = "block";
        return;
      }

      // Create table header
      let tableHTML = `
        <div class="table-header">
          <div>Request ID</div>
          <div>Name</div>
          <div>Email</div>
          <div>Type</div>
          <div>Amount</div>
          <div>Status</div>
          <div>Actions</div>
        </div>
      `;

      // Add table rows
      tableHTML += requests
        .map(
          (req) => `
        <div class="table-row" data-email="${
          req.email
        }" data-status="${req.status.toLowerCase()}" data-name="${
            req.name
          }">
          <div>${req.request_id}</div>
          <div>${req.name}</div>
          <div>${req.email || "N/A"}</div>
          <div>${req.requestType || "Mixed"}</div>
          <div>₹${req.totalAmount || 0}</div>
          <div>
            <span class="badge badge-${req.status.toLowerCase()}">${
            req.status
          }</span>
          </div>
          <div style="white-space: nowrap;">
            <button class="action-btn view-btn" onclick="viewRequestDetails(${
              req.request_id
            })">
              <i class="fa-solid fa-eye"></i>
            </button>
            <button class="action-btn accept-btn" onclick="handleRequestAction(${
              req.request_id
            }, 'approved')" ${
            req.status.toLowerCase() !== "pending" ? "disabled" : ""
          }>
              <i class="fa-solid fa-check"></i>
            </button>
            <button class="action-btn reject-btn" onclick="handleRequestAction(${
              req.request_id
            }, 'rejected')" ${
            req.status.toLowerCase() !== "pending" ? "disabled" : ""
          }>
              <i class="fa-solid fa-times"></i>
            </button>
          </div>
        </div>
      `
        )
        .join("");

      requestsTable.innerHTML = tableHTML;
    } catch (error) {
      console.error("Error fetching requests:", error);
      document.getElementById("requests-loading").style.display = "none";
      document.getElementById("no-requests").style.display = "block";
      document.getElementById("no-requests").innerHTML = `
        <i class="fa-solid fa-exclamation-triangle"></i>
        <p>Error loading requests</p>
        <button class="action-btn" onclick="fetchRequests()">
          <i class="fa-solid fa-refresh"></i> Try Again
        </button>
      `;
    }
  }

  // Filter Requests
  function filterRequests() {
    const search = document.getElementById("search").value.toLowerCase();
    const statusFilter = document.getElementById("status-filter").value;
    const rows = document.querySelectorAll(".table-row");
    let visibleCount = 0;

    rows.forEach((row) => {
      const email = row.dataset.email.toLowerCase();
      const name = row.dataset.name.toLowerCase();
      const status = row.dataset.status.toLowerCase();

      const matchesSearch = email.includes(search) || name.includes(search);
      const matchesStatus =
        statusFilter === "all" || status === statusFilter;

      if (matchesSearch && matchesStatus) {
        row.style.display = "";
        visibleCount++;
      } else {
        row.style.display = "none";
      }
    });

    if (visibleCount === 0) {
      document.getElementById("no-requests").style.display = "block";
      document.getElementById("no-requests").innerHTML = `
        <i class="fa-solid fa-filter"></i>
        <p>No matching requests found</p>
      `;
    } else {
      document.getElementById("no-requests").style.display = "none";
    }
  }

  // View Request Details
  async function viewRequestDetails(requestId) {
    try {
      currentRequestId = requestId;
      openModal("request-modal");

      const detailsContainer = document.getElementById(
        "request-details-content"
      );
      detailsContainer.innerHTML = '<div class="loadingSpinner"></div>';

      // Try to find the request in already loaded requests
      let request = allRequests.find((r) => r.request_id === requestId);

      // If not found, fetch it directly (optional fallback)
      if (!request) {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${API_URL}/api/requests/${requestId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.ok) {
          request = await response.json();
        }
      }

      if (!request) {
        detailsContainer.innerHTML = `
          <div class="error-message">
            Request details not found
          </div>
        `;
        return;
      }

      // Format request details
      const formattedDate = new Date(request.createdAt).toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      );

      let html = `
        <h4 style="margin: 0 0 20px; color: #2d3748;">Request #${
          request.request_id
        }</h4>
        
        <div class="request-details-grid">
          <p>
            <strong>Name</strong>
            <span>${request.name}</span>
          </p>
          <p>
            <strong>Contact</strong>
            <span>${request.phone}</span>
          </p>
          <p>
            <strong>Email</strong>
            <span>${request.email || "Not provided"}</span>
          </p>
          <p>
            <strong>Date Requested</strong>
            <span>${formattedDate}</span>
          </p>
          <p>
            <strong>Address</strong>
            <span>${request.address}, Ward ${request.wardno}, ${
        request.pincode
      }</span>
          </p>
          <p>
            <strong>Family Size</strong>
            <span>${request.familySize || "Not specified"}</span>
          </p>
          <p>
            <strong>Payment Method</strong>
            <span>${
              request.paymentMethod === "upi"
                ? "UPI"
                : request.paymentMethod === "cards"
                ? "Credit/Debit Card"
                : request.paymentMethod === "netbanking"
                ? "Net Banking"
                : "Cash on Delivery"
            }</span>
          </p>
          <p>
            <strong>Payment Status</strong>
            <span>${
              request.paymentStatus === "pending"
                ? "Pending"
                : request.paymentStatus === "paid"
                ? "Paid"
                : "Failed"
            }</span>
          </p>
        </div>
      `;

      if (request.items && request.items.length > 0) {
        html += `<h4 style="margin: 20px 0 10px; color: #2d3748;">Requested Items</h4>`;
        html += `<div class="request-items">`;

        request.items.forEach((item) => {
          html += `
            <div class="request-item">
              <div class="request-item-details">
                <div class="request-item-name">${item.name}</div>
                <div class="request-item-meta">
                  ${item.quantity} × ₹${item.price} (${item.category})
                </div>
              </div>
              <div class="request-item-price">₹${
                item.price * item.quantity
              }</div>
            </div>
          `;
        });

        html += `
          <div class="request-item" style="background: #f1f5f9; font-weight: bold;">
            <div class="request-item-details">Total</div>
            <div class="request-item-price">₹${request.totalAmount}</div>
          </div>
        </div>`;
      }

      html += `<h4 style="margin: 20px 0 10px; color: #2d3748;">Actions</h4>`;

      if (request.status.toLowerCase() === "pending") {
        html += `
          <div style="display: flex; gap: 10px; margin-top: 15px;">
            <button class="action-btn accept-btn" style="flex: 1;" onclick="handleRequestAction(${request.request_id}, 'approved')">
              <i class="fa-solid fa-check"></i> Approve Request
            </button>
            <button class="action-btn reject-btn" style="flex: 1;" onclick="handleRequestAction(${request.request_id}, 'rejected')">
              <i class="fa-solid fa-times"></i> Reject Request
            </button>
          </div>
        `;
      } else if (request.status.toLowerCase() === "approved") {
        html += `
          <div style="display: flex; gap: 10px; margin-top: 15px;">
            <button class="action-btn" style="flex: 1; background: #10b981;" onclick="handleRequestAction(${request.request_id}, 'delivered')">
              <i class="fa-solid fa-truck"></i> Mark as Delivered
            </button>
            <button class="action-btn reject-btn" style="flex: 1;" onclick="handleRequestAction(${request.request_id}, 'rejected')">
              <i class="fa-solid fa-times"></i> Reject Request
            </button>
          </div>
        `;
      } else {
        html += `
          <div style="padding: 15px; background: #f8fafc; border-radius: 8px; text-align: center; color: #718096;">
            No actions available for ${request.status} requests
          </div>
        `;
      }

      detailsContainer.innerHTML = html;
    } catch (error) {
      console.error("Error viewing request details:", error);
      document.getElementById("request-details-content").innerHTML = `
        <div class="error-message">
          Error loading request details. Please try again.
        </div>
      `;
    }
  }

  // Handle Request Action (Approve/Reject/Deliver)
  async function handleRequestAction(requestId, status) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/api/admin/requests/${requestId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      // Close modal if open
      closeModal("request-modal");

      // Update the UI
      fetchRequests();
      fetchStats();

      // Show toast notification
      const action =
        status === "approved"
          ? "approved"
          : status === "rejected"
          ? "rejected"
          : "marked as delivered";
      showToast(`Request ${requestId} has been ${action}`, "success");
    } catch (error) {
      console.error(`Error updating request status:`, error);
      showToast(`Failed to update request status`, "error");
    }
  }

  // Open Resource Modal
  function openResourceModal(resourceId) {
    const resource = allResources.find((r) => r.id === resourceId);

    if (!resource) {
      showToast("Resource not found", "error");
      return;
    }

    document.getElementById("resource-id").value = resource.id;
    document.getElementById("resource-name").value = resource.name;
    document.getElementById("resource-category").value = resource.category;
    document.getElementById("resource-price").value = resource.price;
    document.getElementById("resource-stock").value = resource.stock;
    document.getElementById("resource-description").value =
      resource.description;

    openModal("resource-modal");
  }

  // Update Resource
  async function updateResource() {
    try {
      const resourceId = document.getElementById("resource-id").value;
      const price = parseFloat(
        document.getElementById("resource-price").value
      );
      const stock = parseInt(
        document.getElementById("resource-stock").value
      );
      const description = document.getElementById(
        "resource-description"
      ).value;

      if (isNaN(price) || price < 0) {
        showToast("Please enter a valid price", "error");
        return;
      }

      if (isNaN(stock) || stock < 0) {
        showToast("Please enter a valid stock quantity", "error");
        return;
      }

      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/api/resources/${resourceId}/stock`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ stock }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      // Close modal
      closeModal("resource-modal");

      // Refresh resources
      fetchResources();

      // Show toast notification
      showToast("Resource updated successfully", "success");
    } catch (error) {
      console.error("Error updating resource:", error);
      showToast("Failed to update resource", "error");
    }
  }

  // Open Add Resource Modal
  function openAddResourceModal() {
    document.getElementById("add-resource-form").reset();
    openModal("add-resource-modal");
  }

  // Add Resource
  async function addResource() {
    try {
      const id = document.getElementById("new-resource-id").value;
      const name = document.getElementById("new-resource-name").value;
      const category = document.getElementById(
        "new-resource-category"
      ).value;
      const price = parseFloat(
        document.getElementById("new-resource-price").value
      );
      const stock = parseInt(
        document.getElementById("new-resource-stock").value
      );
      const description = document.getElementById(
        "new-resource-description"
      ).value;

      if (
        !id ||
        !name ||
        !category ||
        isNaN(price) ||
        isNaN(stock) ||
        !description
      ) {
        showToast("Please fill all required fields", "error");
        return;
      }

      // Create resource object
      const resource = {
        id,
        name,
        category,
        price,
        stock,
        description,
      };

      // In a real implementation, you would send this to an API endpoint
      console.log("Adding resource:", resource);

      // Simulate API call (replace with actual API call)
      allResources.push(resource);

      // Close modal
      closeModal("add-resource-modal");

      // Refresh resources
      fetchResources();

      // Show toast notification
      showToast("Resource added successfully", "success");
    } catch (error) {
      console.error("Error adding resource:", error);
      showToast("Failed to add resource", "error");
    }
  }

  // Open Add Request Modal
  function openAddRequestModal() {
    document.getElementById("add-request-form").reset();
    selectedResourcesForRequest = [];
    updateResourceSelectionInForm();
    openModal("add-request-modal");
  }

  // Add Request
  async function addRequest() {
    try {
      // Get form values
      const name = document.getElementById("add-name").value;
      const phone = document.getElementById("add-phone").value;
      const email = document.getElementById("add-email").value;
      const aadhar = document.getElementById("add-aadhar").value;
      const address = document.getElementById("add-address").value;
      const wardno = document.getElementById("add-ward").value;
      const pincode = document.getElementById("add-pincode").value;
      const familySize = document.getElementById("add-family-size").value;
      const paymentMethod =
        document.getElementById("add-payment-method").value;
      const paymentStatus =
        document.getElementById("add-payment-status").value;

      // Validation
      if (
        !name ||
        !phone ||
        !address ||
        !wardno ||
        !pincode ||
        !familySize
      ) {
        showToast("Please fill all required fields", "error");
        return;
      }

      if (selectedResourcesForRequest.length === 0) {
        showToast("Please select at least one resource", "error");
        return;
      }

      // Calculate total amount
      const totalAmount = selectedResourcesForRequest.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      // Create request object
      const requestData = {
        name,
        phone,
        email,
        aadhar,
        address,
        wardno,
        pincode,
        familySize,
        items: selectedResourcesForRequest,
        totalAmount,
        paymentMethod,
        paymentStatus,
      };

      console.log("Adding request:", requestData);

      // Make API call
      const response = await fetch(`${API_URL}/api/requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      // Close modal
      closeModal("add-request-modal");

      // Reset form and selected resources
      document.getElementById("add-request-form").reset();
      selectedResourcesForRequest = [];

      // Refresh requests
      fetchRequests();
      fetchStats();

      // Show toast notification
      showToast("Request added successfully", "success");
    } catch (error) {
      console.error("Error adding request:", error);
      showToast("Failed to add request", "error");
    }
  }

  // Modal Functions
  function openModal(id) {
    document.getElementById(id).style.display = "block";
    // Prevent body scrolling when modal is open
    document.body.style.overflow = "hidden";
  }

  function closeModal(id) {
    document.getElementById(id).style.display = "none";
    // Re-enable body scrolling
    document.body.style.overflow = "";
  }

  // Show Toast Notification
  function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toast-message");
    const toastTitle = document.querySelector(".toast-title");
    const toastIcon = document.querySelector(".toast-icon i");

    // Set toast type
    toast.className = "toast " + type;

    // Set title and icon based on type
    if (type === "success") {
      toastTitle.textContent = "Success";
      toastIcon.className = "fa-solid fa-check";
    } else {
      toastTitle.textContent = "Error";
      toastIcon.className = "fa-solid fa-exclamation";
    }

    // Set message
    toastMessage.textContent = message;

    // Show toast
    toast.style.display = "flex";

    // Auto-hide toast after 3 seconds
    setTimeout(() => {
      toast.style.display = "none";
    }, 3000);
  }

  // Close modal when clicking outside
  window.onclick = function (event) {
    const modals = document.getElementsByClassName("modal");
    for (let modal of modals) {
      if (event.target == modal) {
        modal.style.display = "none";
        document.body.style.overflow = "";
      }
    }
  };

  // Initialize
  document.addEventListener("DOMContentLoaded", checkAdminAccess);