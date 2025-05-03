// Resource data
const API_URL = "http://localhost:5000"; // Adjust as needed
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

// Global variables
let cart = [];
let currentPage = 1;
const itemsPerPage = 6;
let currentCategory = "all";
let checkoutStep = "delivery";
let deliveryFormData = {};
let paymentMethod = "upi";
let uploadedRationCard = null;

// API URL

// DOM Elements
const resourceItemsContainer = document.getElementById("resource-items");
const paginationContainer = document.getElementById("pagination");
const cartPanel = document.getElementById("cart-panel");
const cartItemsContainer = document.getElementById("cart-items");
const emptyCartMessage = document.getElementById("empty-cart-message");
const cartTotalElement = document.getElementById("cart-total");
const cartCountElement = document.getElementById("cart-count");
const checkoutButton = document.getElementById("checkout-btn");
const checkoutForm = document.getElementById("checkout-form");
const toastElement = document.getElementById("toast");
const spinnerOverlay = document.getElementById("spinner-overlay");

// Initialize the page
document.addEventListener("DOMContentLoaded", function () {
  // Initialize resource items
  filterAndDisplayResources();

  // Set up event listeners
  setupEventListeners();

  // Initialize cart from localStorage if available
  initializeCartFromStorage();
});

// Set up event listeners
function setupEventListeners() {
  // Category tab buttons
  const tabButtons = document.querySelectorAll(".tab-btn");
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      currentCategory = button.getAttribute("data-category");
      currentPage = 1;
      filterAndDisplayResources();
    });
  });

  // Cart icon in nav
  document
    .getElementById("cart-icon")
    .addEventListener("click", toggleCart);

  // Close cart button
  document
    .getElementById("close-cart")
    .addEventListener("click", toggleCart);

  // Checkout button
  checkoutButton.addEventListener("click", openCheckoutForm);

  // Close notification banner
  document
    .getElementById("close-notification")
    .addEventListener("click", function () {
      document.getElementById("notification-banner").style.display =
        "none";
    });

  // Delivery form submission
  document
    .getElementById("delivery-form")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      if (validateDeliveryForm()) {
        collectDeliveryFormData();
        goToStep("review");
      }
    });

  // Payment form submission
  document
    .getElementById("payment-form")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      if (validatePaymentForm()) {
        processPayment();
      }
    });

  // Payment method selection
  const paymentMethods = document.querySelectorAll(
    'input[name="payment-method"]'
  );
  paymentMethods.forEach((method) => {
    method.addEventListener("change", function () {
      paymentMethod = this.value;
      togglePaymentForms();
    });
  });

  // Mobile nav hamburger
  document
    .querySelector(".hamburger")
    .addEventListener("click", function () {
      const navLinks = document.querySelector(".nav-links");
      navLinks.classList.toggle("open");
    });
}

// Filter and display resources based on current category and page
function filterAndDisplayResources() {
  let filteredResources;

  // Filter by category
  if (currentCategory === "all") {
    filteredResources = allResources;
  } else {
    filteredResources = allResources.filter(
      (item) => item.category === currentCategory
    );
  }

  // Paginate results
  const totalPages = Math.ceil(filteredResources.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedResources = filteredResources.slice(
    startIndex,
    endIndex
  );

  // Clear previous items
  resourceItemsContainer.innerHTML = "";

  // Add items to container
  paginatedResources.forEach((item) => {
    const resourceItem = createResourceItemElement(item);
    resourceItemsContainer.appendChild(resourceItem);
  });

  // Update pagination
  createPagination(totalPages);
}

// Create resource item element
function createResourceItemElement(item) {
  const itemElement = document.createElement("div");
  itemElement.className = "resource-item";
  itemElement.dataset.id = item.id;

  // Add low stock badge if applicable
  if (item.stock < 20) {
    const badge = document.createElement("div");
    badge.className = "resource-item-badge";
    badge.textContent = "Low Stock";
    itemElement.appendChild(badge);
  }

  const itemContent = `
  <h3>${item.name}</h3>
  <p class="resource-item-description">${item.description}</p>
  <p class="resource-item-price">₹${item.price}</p>
  <div class="resource-item-actions">
      <div class="quantity-control">
          <button class="quantity-btn" onclick="decrementQuantity('${item.id}')">-</button>
          <input type="number" id="qty-${item.id}" class="quantity-input" value="0" min="0" max="5" onchange="validateQuantity('${item.id}')">
          <button class="quantity-btn" onclick="incrementQuantity('${item.id}')">+</button>
      </div>
      <button class="add-to-cart-btn" onclick="addToCart('${item.id}')">Add</button>
  </div>
`;

  itemElement.innerHTML = itemContent;

  // Add fade-in animation
  itemElement.style.animationDelay = `${Math.random() * 0.3}s`;

  return itemElement;
}

// Create pagination controls
function createPagination(totalPages) {
  paginationContainer.innerHTML = "";

  if (totalPages <= 1) {
    return;
  }

  // Previous button
  const prevButton = document.createElement("div");
  prevButton.className = `page-item ${
    currentPage === 1 ? "disabled" : ""
  }`;
  prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
  if (currentPage > 1) {
    prevButton.addEventListener("click", () => {
      currentPage--;
      filterAndDisplayResources();
      window.scrollTo({
        top: document.getElementById("resources").offsetTop - 100,
        behavior: "smooth",
      });
    });
  }
  paginationContainer.appendChild(prevButton);

  // Page numbers
  const maxVisiblePages = 5;
  let startPage = Math.max(
    1,
    currentPage - Math.floor(maxVisiblePages / 2)
  );
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  // First page
  if (startPage > 1) {
    const firstPageItem = document.createElement("div");
    firstPageItem.className = "page-item";
    firstPageItem.textContent = "1";
    firstPageItem.addEventListener("click", () => {
      currentPage = 1;
      filterAndDisplayResources();
      window.scrollTo({
        top: document.getElementById("resources").offsetTop - 100,
        behavior: "smooth",
      });
    });
    paginationContainer.appendChild(firstPageItem);

    if (startPage > 2) {
      const ellipsisItem = document.createElement("div");
      ellipsisItem.className = "page-item disabled";
      ellipsisItem.textContent = "...";
      paginationContainer.appendChild(ellipsisItem);
    }
  }

  // Page numbers
  for (let i = startPage; i <= endPage; i++) {
    const pageItem = document.createElement("div");
    pageItem.className = `page-item ${i === currentPage ? "active" : ""}`;
    pageItem.textContent = i;

    if (i !== currentPage) {
      pageItem.addEventListener("click", () => {
        currentPage = i;
        filterAndDisplayResources();
        window.scrollTo({
          top: document.getElementById("resources").offsetTop - 100,
          behavior: "smooth",
        });
      });
    }

    paginationContainer.appendChild(pageItem);
  }

  // Last page
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      const ellipsisItem = document.createElement("div");
      ellipsisItem.className = "page-item disabled";
      ellipsisItem.textContent = "...";
      paginationContainer.appendChild(ellipsisItem);
    }

    const lastPageItem = document.createElement("div");
    lastPageItem.className = "page-item";
    lastPageItem.textContent = totalPages;
    lastPageItem.addEventListener("click", () => {
      currentPage = totalPages;
      filterAndDisplayResources();
      window.scrollTo({
        top: document.getElementById("resources").offsetTop - 100,
        behavior: "smooth",
      });
    });
    paginationContainer.appendChild(lastPageItem);
  }

  // Next button
  const nextButton = document.createElement("div");
  nextButton.className = `page-item ${
    currentPage === totalPages ? "disabled" : ""
  }`;
  nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
  if (currentPage < totalPages) {
    nextButton.addEventListener("click", () => {
      currentPage++;
      filterAndDisplayResources();
      window.scrollTo({
        top: document.getElementById("resources").offsetTop - 100,
        behavior: "smooth",
      });
    });
  }
  paginationContainer.appendChild(nextButton);
}

// Increment quantity
function incrementQuantity(itemId) {
  const quantityInput = document.getElementById(`qty-${itemId}`);
  let currentQuantity = parseInt(quantityInput.value);
  if (currentQuantity < 5) {
    quantityInput.value = currentQuantity + 1;
  }
}

// Decrement quantity
function decrementQuantity(itemId) {
  const quantityInput = document.getElementById(`qty-${itemId}`);
  let currentQuantity = parseInt(quantityInput.value);
  if (currentQuantity > 0) {
    quantityInput.value = currentQuantity - 1;
  }
}

// Validate quantity
function validateQuantity(itemId) {
  const quantityInput = document.getElementById(`qty-${itemId}`);
  let currentQuantity = parseInt(quantityInput.value);

  if (isNaN(currentQuantity) || currentQuantity < 0) {
    quantityInput.value = 0;
  } else if (currentQuantity > 5) {
    quantityInput.value = 5;
    showToast("Maximum 5 units per item allowed");
  }
}

// Add to cart
function addToCart(itemId) {
  const quantityInput = document.getElementById(`qty-${itemId}`);
  const quantity = parseInt(quantityInput.value);

  if (quantity <= 0) {
    showToast("Please select a quantity greater than zero");
    return;
  }

  // Find the item in resources
  const item = allResources.find((resource) => resource.id === itemId);

  if (!item) {
    showToast("Item not found");
    return;
  }

  // Check if item already exists in cart
  const existingItemIndex = cart.findIndex(
    (cartItem) => cartItem.id === itemId
  );

  if (existingItemIndex !== -1) {
    // Update quantity if it exists
    const newQuantity = cart[existingItemIndex].quantity + quantity;

    if (newQuantity > 5) {
      showToast("Maximum 5 units per item allowed");
      cart[existingItemIndex].quantity = 5;
    } else {
      cart[existingItemIndex].quantity = newQuantity;
      showToast(`Updated ${item.name} quantity in cart`);
    }
  } else {
    // Add new item to cart
    cart.push({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: quantity,
      category: item.category,
    });
    showToast(`Added ${item.name} to cart`);
  }

  // Reset quantity input
  quantityInput.value = 0;

  // Save cart to localStorage
  saveCartToStorage();

  // Update cart UI
  updateCartUI();
}

// Remove from cart
function removeFromCart(itemId) {
  cart = cart.filter((item) => item.id !== itemId);

  // Save cart to localStorage
  saveCartToStorage();

  // Update cart UI
  updateCartUI();

  showToast("Item removed from cart");
}

// Update cart UI
function updateCartUI() {
  // Clear cart items container
  cartItemsContainer.innerHTML = "";

  if (cart.length === 0) {
    // Show empty cart message
    emptyCartMessage.style.display = "block";
    cartItemsContainer.appendChild(emptyCartMessage);
    checkoutButton.disabled = true;
  } else {
    // Hide empty cart message
    emptyCartMessage.style.display = "none";

    // Add cart items
    cart.forEach((item) => {
      const cartItemElement = document.createElement("div");
      cartItemElement.className = "cart-item";

      cartItemElement.innerHTML = `
          <div class="cart-item-info">
              <div class="cart-item-name">${item.name}</div>
              <div class="cart-item-price">₹${
                item.price
              } × <span class="cart-item-quantity">${
        item.quantity
      }</span></div>
          </div>
          <div class="cart-item-total">₹${
            item.price * item.quantity
          }</div>
          <button class="cart-item-remove" onclick="removeFromCart('${
            item.id
          }')">
              <i class="fas fa-trash-alt"></i>
          </button>
      `;

      cartItemsContainer.appendChild(cartItemElement);
    });

    // Add empty cart message (hidden)
    emptyCartMessage.style.display = "none";
    cartItemsContainer.appendChild(emptyCartMessage);

    // Enable checkout button
    checkoutButton.disabled = false;
  }

  // Update cart count and total
  updateCartCountAndTotal();
}

// Update cart count and total
function updateCartCountAndTotal() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  cartCountElement.textContent = totalItems;
  cartTotalElement.textContent = totalAmount;

  // Also update other total elements if they exist
  const reviewTotalElement = document.getElementById("review-total");
  const paymentAmountElement = document.getElementById("payment-amount");

  if (reviewTotalElement) {
    reviewTotalElement.textContent = totalAmount;
  }

  if (paymentAmountElement) {
    paymentAmountElement.textContent = totalAmount;
  }
}

// Toggle cart panel
function toggleCart() {
  if (cartPanel.style.right === "0px") {
    cartPanel.style.right = "-400px";
  } else {
    cartPanel.style.right = "0px";
  }
}

// Open checkout form
function openCheckoutForm() {
  // Hide cart panel
  cartPanel.style.right = "-400px";

  // Show checkout form
  checkoutForm.classList.add("active");

  // Reset checkout steps
  resetCheckoutSteps();
}

// Close checkout form
function closeCheckoutForm() {
  checkoutForm.classList.remove("active");
}

// Go to specific checkout step
function goToStep(step) {
  checkoutStep = step;

  // Update step classes
  const steps = document.querySelectorAll(".step");
  steps.forEach((stepEl) => {
    const stepData = stepEl.getAttribute("data-step");

    // Remove all classes first
    stepEl.classList.remove("active", "completed");

    // Add appropriate class
    if (stepData === step) {
      stepEl.classList.add("active");
    } else if (
      (step === "review" && stepData === "delivery") ||
      (step === "payment" &&
        (stepData === "delivery" || stepData === "review")) ||
      (step === "confirmation" &&
        (stepData === "delivery" ||
          stepData === "review" ||
          stepData === "payment"))
    ) {
      stepEl.classList.add("completed");
    }
  });

  // Hide all step contents
  const stepContents = document.querySelectorAll(
    ".checkout-step-content"
  );
  stepContents.forEach((content) => {
    content.classList.add("hidden");
  });

  // Show the current step content
  document.getElementById(`${step}-step`).classList.remove("hidden");

  // Special handling for specific steps
  if (step === "review") {
    populateReviewStep();
  } else if (step === "payment") {
    // Ensure payment amount is updated
    document.getElementById("payment-amount").textContent = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }
}

// Reset checkout steps
function resetCheckoutSteps() {
  goToStep("delivery");

  // Reset form data
  deliveryFormData = {};

  // Reset form fields
  document.getElementById("delivery-form").reset();
  document.getElementById("payment-form").reset();

  // Clear error messages
  const errorMessages = document.querySelectorAll(".error-message");
  errorMessages.forEach((error) => {
    error.textContent = "";
  });

  // Reset file upload
  uploadedRationCard = null;
  const filePreviewContainer = document.getElementById(
    "file-preview-container"
  );
  filePreviewContainer.style.display = "none";
  filePreviewContainer.innerHTML = "";
}

// Handle file upload
function handleFileUpload(inputElement) {
  const file = inputElement.files[0];
  const filePreviewContainer = document.getElementById(
    "file-preview-container"
  );
  const errorElement = document.getElementById("ration-card-error");

  // Reset error
  errorElement.textContent = "";

  if (file) {
    // Validate file type
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/pdf",
    ];
    if (!validTypes.includes(file.type)) {
      errorElement.textContent = "Please upload a JPG, PNG or PDF file";
      inputElement.value = "";
      filePreviewContainer.style.display = "none";
      uploadedRationCard = null;
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      errorElement.textContent = "File size exceeds 2MB limit";
      inputElement.value = "";
      filePreviewContainer.style.display = "none";
      uploadedRationCard = null;
      return;
    }

    // Store file for submission
    uploadedRationCard = file;

    // Show preview
    filePreviewContainer.style.display = "flex";

    // Create preview content
    let fileIcon = "";
    if (file.type === "application/pdf") {
      fileIcon =
        '<i class="fas fa-file-pdf" style="font-size: 2rem; color: #f44336;"></i>';
    } else {
      // For images, create thumbnail
      const reader = new FileReader();
      reader.onload = function (e) {
        const img = document.createElement("img");
        img.src = e.target.result;
        document.querySelector(".file-preview-icon").innerHTML = "";
        document.querySelector(".file-preview-icon").appendChild(img);
      };
      reader.readAsDataURL(file);
      fileIcon = '<div class="file-preview-icon"></div>';
    }

    filePreviewContainer.innerHTML = `
      ${fileIcon}
      <div class="file-info">
        <div class="file-name">${file.name}</div>
        <div class="file-size">${formatFileSize(file.size)}</div>
      </div>
      <button type="button" onclick="removeFile()">
        <i class="fas fa-times"></i>
      </button>
    `;
  }
}

// Format file size
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + " bytes";
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  else return (bytes / 1048576).toFixed(1) + " MB";
}

// Remove uploaded file
function removeFile() {
  const fileInput = document.getElementById("ration-card");
  fileInput.value = "";
  uploadedRationCard = null;

  const filePreviewContainer = document.getElementById(
    "file-preview-container"
  );
  filePreviewContainer.style.display = "none";
}

// Validate delivery form
function validateDeliveryForm() {
  let isValid = true;

  // Clear previous error messages
  const errorMessages = document.querySelectorAll(".error-message");
  errorMessages.forEach((error) => {
    error.textContent = "";
  });

  // Validate name
  const nameInput = document.getElementById("name");
  if (!nameInput.value.trim()) {
    document.getElementById("name-error").textContent =
      "Name is required";
    isValid = false;
  } else if (nameInput.value.trim().length < 3) {
    document.getElementById("name-error").textContent =
      "Name must be at least 3 characters";
    isValid = false;
  }

  // Validate phone
  const phoneInput = document.getElementById("phone");
  const phonePattern = /^[0-9]{10}$/;
  if (!phoneInput.value.trim()) {
    document.getElementById("phone-error").textContent =
      "Phone number is required";
    isValid = false;
  } else if (!phonePattern.test(phoneInput.value.trim())) {
    document.getElementById("phone-error").textContent =
      "Enter a valid 10-digit phone number";
    isValid = false;
  }

  // Validate email
  const emailInput = document.getElementById("email");
  if (!emailInput.value.trim()) {
    document.getElementById("email-error").textContent =
      "Email is required";
    isValid = false;
  } else {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(emailInput.value.trim())) {
      document.getElementById("email-error").textContent =
        "Enter a valid email address";
      isValid = false;
    }
  }

  // Validate aadhar
  const aadharInput = document.getElementById("aadhar");
  if (!aadharInput.value.trim()) {
    document.getElementById("aadhar-error").textContent =
      "Aadhar number is required";
    isValid = false;
  } else {
    const aadharPattern = /^[0-9]{12}$/;
    if (!aadharPattern.test(aadharInput.value.trim())) {
      document.getElementById("aadhar-error").textContent =
        "Aadhar should be 12 digits";
      isValid = false;
    }
  }

  // Validate ration card
  if (!uploadedRationCard) {
    document.getElementById("ration-card-error").textContent =
      "Please upload your ration card";
    isValid = false;
  }

  // Validate address
  const addressInput = document.getElementById("address");
  if (!addressInput.value.trim()) {
    document.getElementById("address-error").textContent =
      "Address is required";
    isValid = false;
  } else if (addressInput.value.trim().length < 10) {
    document.getElementById("address-error").textContent =
      "Please enter complete address";
    isValid = false;
  }

  // Validate ward number
  const wardInput = document.getElementById("wardno");
  if (!wardInput.value.trim()) {
    document.getElementById("wardno-error").textContent =
      "Ward number is required";
    isValid = false;
  }

  // Validate pincode
  const pincodeInput = document.getElementById("pincode");
  const pincodePattern = /^[0-9]{6}$/;
  if (!pincodeInput.value.trim()) {
    document.getElementById("pincode-error").textContent =
      "PIN code is required";
    isValid = false;
  } else if (!pincodePattern.test(pincodeInput.value.trim())) {
    document.getElementById("pincode-error").textContent =
      "Enter a valid 6-digit PIN code";
    isValid = false;
  }

  // Validate family size
  const familySizeInput = document.getElementById("family-size");
  if (!familySizeInput.value) {
    document.getElementById("family-size-error").textContent =
      "Please select family size";
    isValid = false;
  }

  return isValid;
}

// Collect delivery form data
function collectDeliveryFormData() {
  deliveryFormData = {
    name: document.getElementById("name").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    email: document.getElementById("email").value.trim(),
    aadhar: document.getElementById("aadhar").value.trim(),
    address: document.getElementById("address").value.trim(),
    wardno: document.getElementById("wardno").value.trim(),
    pincode: document.getElementById("pincode").value.trim(),
    familySize: document.getElementById("family-size").value,
    rationCard: uploadedRationCard,
  };
}

// Populate review step
function populateReviewStep() {
  // Populate delivery info
  const reviewDeliveryInfo = document.getElementById(
    "review-delivery-info"
  );
  reviewDeliveryInfo.innerHTML = `
  <div class="review-info-row">
      <span class="review-info-label">Name:</span>
      <span class="review-info-value">${deliveryFormData.name}</span>
  </div>
  <div class="review-info-row">
      <span class="review-info-label">Phone:</span>
      <span class="review-info-value">${deliveryFormData.phone}</span>
  </div>
  <div class="review-info-row">
      <span class="review-info-label">Email:</span>
      <span class="review-info-value">${deliveryFormData.email}</span>
  </div>
  <div class="review-info-row">
      <span class="review-info-label">Aadhar:</span>
      <span class="review-info-value">${deliveryFormData.aadhar.replace(
        /(\d{4})(\d{4})(\d{4})/,
        "$1-$2-$3"
      )}</span>
  </div>
  <div class="review-info-row">
      <span class="review-info-label">Ration Card:</span>
      <span class="review-info-value">${
        deliveryFormData.rationCard ? "Uploaded" : "Not uploaded"
      }</span>
  </div>
  <div class="review-info-row">
      <span class="review-info-label">Address:</span>
      <span class="review-info-value">${deliveryFormData.address}</span>
  </div>
  <div class="review-info-row">
      <span class="review-info-label">Ward/PIN:</span>
      <span class="review-info-value">Ward ${deliveryFormData.wardno}, ${
    deliveryFormData.pincode
  }</span>
  </div>
  <div class="review-info-row">
      <span class="review-info-label">Family Size:</span>
      <span class="review-info-value">${
        deliveryFormData.familySize
      }</span>
  </div>
`;

  // Populate order items
  const reviewItems = document.getElementById("review-items");
  reviewItems.innerHTML = "";

  cart.forEach((item) => {
    const reviewItem = document.createElement("div");
    reviewItem.className = "review-item";

    reviewItem.innerHTML = `
      <div>
          <div class="review-item-name">${item.name}</div>
          <div class="review-item-quantity">Qty: ${item.quantity}</div>
      </div>
      <div class="review-item-price">₹${item.price * item.quantity}</div>
    `;

    reviewItems.appendChild(reviewItem);
  });

  // Update total
  document.getElementById("review-total").textContent = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
}

// Toggle payment forms based on selected payment method
function togglePaymentForms() {
  // Hide all payment forms first
  document.querySelectorAll(".payment-method-form").forEach((form) => {
    form.classList.add("hidden");
  });

  // Show the selected payment form
  document
    .getElementById(`${paymentMethod}-form`)
    .classList.remove("hidden");
}

// Validate payment form
function validatePaymentForm() {
  let isValid = true;

  // Clear previous error messages
  const errorMessages = document.querySelectorAll(".error-message");
  errorMessages.forEach((error) => {
    error.textContent = "";
  });

  // Validate based on payment method
  switch (paymentMethod) {
    case "upi":
      const upiIdInput = document.getElementById("upi-id");
      const upiPattern = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;

      if (!upiIdInput.value.trim()) {
        document.getElementById("upi-id-error").textContent =
          "UPI ID is required";
        isValid = false;
      } else if (!upiPattern.test(upiIdInput.value.trim())) {
        document.getElementById("upi-id-error").textContent =
          "Enter a valid UPI ID (e.g., name@upi)";
        isValid = false;
      }
      break;

    case "cards":
      // Validate card number
      const cardNumberInput = document.getElementById("card-number");
      const cardNumberPattern = /^[0-9]{16}$/;

      if (!cardNumberInput.value.trim()) {
        document.getElementById("card-number-error").textContent =
          "Card number is required";
        isValid = false;
      } else if (
        !cardNumberPattern.test(cardNumberInput.value.replace(/\s/g, ""))
      ) {
        document.getElementById("card-number-error").textContent =
          "Enter a valid 16-digit card number";
        isValid = false;
      }

      // Validate expiry date
      const cardExpiryInput = document.getElementById("card-expiry");
      const expiryPattern = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;

      if (!cardExpiryInput.value.trim()) {
        document.getElementById("card-expiry-error").textContent =
          "Expiry date is required";
        isValid = false;
      } else if (!expiryPattern.test(cardExpiryInput.value.trim())) {
        document.getElementById("card-expiry-error").textContent =
          "Enter a valid expiry date (MM/YY)";
        isValid = false;
      } else {
        // Check if card is expired
        const [month, year] = cardExpiryInput.value.split("/");
        const expiryDate = new Date(
          2000 + parseInt(year),
          parseInt(month) - 1,
          1
        );
        const currentDate = new Date();

        if (expiryDate < currentDate) {
          document.getElementById("card-expiry-error").textContent =
            "Card has expired";
          isValid = false;
        }
      }

      // Validate CVV
      const cardCvvInput = document.getElementById("card-cvv");
      const cvvPattern = /^[0-9]{3,4}$/;

      if (!cardCvvInput.value.trim()) {
        document.getElementById("card-cvv-error").textContent =
          "CVV is required";
        isValid = false;
      } else if (!cvvPattern.test(cardCvvInput.value.trim())) {
        document.getElementById("card-cvv-error").textContent =
          "Enter a valid CVV";
        isValid = false;
      }

      // Validate name on card
      const cardNameInput = document.getElementById("card-name");

      if (!cardNameInput.value.trim()) {
        document.getElementById("card-name-error").textContent =
          "Name on card is required";
        isValid = false;
      }
      break;

    case "netbanking":
      const bankSelectInput = document.getElementById("bank-select");

      if (!bankSelectInput.value) {
        document.getElementById("bank-select-error").textContent =
          "Please select a bank";
        isValid = false;
      }
      break;

    case "cod":
      // No additional validation needed for COD
      break;
  }

  return isValid;
}

// Process payment using Razorpay

// Mock data (replace with your actual data sources)

function showToast(message, type) {
console.log(`Toast: ${message} (${type})`); // Replace with your toast implementation
}

function processPayment() {
const paymentButton = document.querySelector("#paymentButton");
console.log("Payment button:", paymentButton);
if (paymentButton) paymentButton.disabled = true;

const spinnerOverlay = document.getElementById("spinnerOverlay") || { style: { display: "none" } };
spinnerOverlay.style.display = "flex";

const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
const requestData = {
name: deliveryFormData.name,
phone: deliveryFormData.phone,
email: deliveryFormData.email,
aadhar: deliveryFormData.aadhar, // Ensure this matches backend key
address: deliveryFormData.address,
wardno: deliveryFormData.wardno,
pincode: deliveryFormData.pincode,
familySize: deliveryFormData.familySize,
items: cart.map((item) => ({
  id: item.id,
  name: item.name,
  price: item.price,
  quantity: item.quantity,
  category: item.category,
})),
totalAmount: totalAmount,
paymentMethod: paymentMethod,
};

console.log("Sending request data:", JSON.stringify(requestData, null, 2)); // Detailed log

fetch(`${API_URL}/api/requests`, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(requestData),
})
.then((response) => {
  if (!response.ok) {
    return response.json().then((err) => {
      throw new Error(err.message || `Server error: ${response.status}`);
    });
  }
  return response.json();
})
.then((data) => {
  console.log("Backend response:", data);
  if (data.payment && data.payment.orderId) {
    const options = {
      key: "rzp_test_bZWOcTtgLAp6U8", // Replace with your test key
      amount: totalAmount * 100,
      currency: "INR",
      order_id: data.payment.orderId,
      handler: function (response) {
        verifyPayment(response, data.requestId);
      },
      modal: {
        ondismiss: () => {
          spinnerOverlay.style.display = "none";
          if (paymentButton) paymentButton.disabled = false;
        },
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  } else {
    throw new Error("No order ID returned");
  }
})
.catch((error) => {
  console.error("Payment error:", error);
  showToast(`Payment failed: ${error.message}`, "error");
  spinnerOverlay.style.display = "none";
  if (paymentButton) paymentButton.disabled = false;
});
}


// Verify payment with server
function verifyPayment(paymentResponse, requestId) {
  // Show loading spinner
  spinnerOverlay.style.display = "flex";

  // Send verification to server
  fetch(`${API_URL}/api/payments/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      razorpay_payment_id: paymentResponse.razorpay_payment_id,
      razorpay_order_id: paymentResponse.razorpay_order_id,
      razorpay_signature: paymentResponse.razorpay_signature,
      requestId: requestId,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Payment verification failed");
      }
      return response.json();
    })
    .then((data) => {
      spinnerOverlay.style.display = "none";
      if (data.success) {
        // Payment successful - proceed to confirmation
        completePurchase(requestId);
      } else {
        // Payment verification failed
        showToast("Payment verification failed", "error");
      }
    })
    .catch((error) => {
      console.error("Verification error:", error);
      spinnerOverlay.style.display = "none";
      showToast("Payment verification failed", "error");
    });
}

// Submit order for COD
function submitOrder(requestData) {
  fetch(`${API_URL}/api/requests/cod`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestData),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to create order");
      }
      return response.json();
    })
    .then((data) => {
      spinnerOverlay.style.display = "none";
      completePurchase(data.requestId);
    })
    .catch((error) => {
      console.error("Order submission error:", error);
      spinnerOverlay.style.display = "none";
      showToast("Failed to submit your order", "error");
    });
}

// Upload ration card to server and continue with purchase
function uploadRationCard(requestId) {
  if (!uploadedRationCard) {
    completePurchase(requestId);
    return;
  }

  const formData = new FormData();
  formData.append("rationCard", uploadedRationCard);
  formData.append("requestId", requestId);

  fetch(`${API_URL}/api/upload/rationcard`, {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        console.warn(
          "Ration card upload failed but continuing with purchase"
        );
      }
      completePurchase(requestId);
    })
    .catch((error) => {
      console.warn("Ration card upload error:", error);
      completePurchase(requestId);
    });
}

// Complete purchase and show confirmation
function completePurchase(requestId) {
  // Generate request ID if not provided
  const displayRequestId = requestId || generateRequestId();

  // Get current date
  const currentDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  // Get payment method display text
  let paymentMethodText;
  switch (paymentMethod) {
    case "upi":
      paymentMethodText = "UPI";
      break;
    case "cards":
      paymentMethodText = "Credit/Debit Card";
      break;
    case "netbanking":
      paymentMethodText = "Net Banking";
      break;
    case "cod":
      paymentMethodText = "Cash on Delivery";
      break;
  }

  // Calculate total amount
  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Update confirmation details
  document.getElementById("request-id").textContent = displayRequestId;
  document.getElementById("request-date").textContent = currentDate;
  document.getElementById("paid-amount").textContent = totalAmount;
  document.getElementById("payment-method-used").textContent =
    paymentMethodText;

  // Go to confirmation step
  goToStep("confirmation");

  // Clear cart
  cart = [];
  saveCartToStorage();
  updateCartUI();

  // Hide spinner
  spinnerOverlay.style.display = "none";
}

// Generate random request ID
function generateRequestId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Show toast notification
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toast-message");
  const toastIcon = document.querySelector(".toast-icon i");

  // Set message
  toastMessage.textContent = message;

  // Set icon based on type
  if (type === "success") {
    toastIcon.className = "fas fa-check-circle";
    toastIcon.style.color = "var(--success-color)";
  } else if (type === "error") {
    toastIcon.className = "fas fa-exclamation-circle";
    toastIcon.style.color = "var(--error-color)";
  } else if (type === "warning") {
    toastIcon.className = "fas fa-exclamation-triangle";
    toastIcon.style.color = "var(--warning-color)";
  }

  // Show toast
  toast.classList.add("show");

  // Auto-hide toast after 3 seconds
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// Save cart to localStorage
function saveCartToStorage() {
  localStorage.setItem("crisis-aid-cart", JSON.stringify(cart));
}

// Initialize cart from localStorage
function initializeCartFromStorage() {
  const savedCart = localStorage.getItem("crisis-aid-cart");

  if (savedCart) {
    cart = JSON.parse(savedCart);
    updateCartUI();
  }
}

// Scroll to resources section
function scrollToResources() {
  const resourcesSection = document.getElementById("resources");
  resourcesSection.scrollIntoView({ behavior: "smooth" });
}

// Format card number with spaces
document.addEventListener("input", function (e) {
  if (e.target.id === "card-number") {
    e.target.value = formatCardNumber(e.target.value);
  }
});

// Format card number
function formatCardNumber(value) {
  // Remove all non-digit characters
  const v = value.replace(/\D/g, "");

  // Add space after every 4 digits
  return v.replace(/(\d{4})(?=\d)/g, "$1 ");
}

// Format expiry date
document.addEventListener("input", function (e) {
  if (e.target.id === "card-expiry") {
    const v = e.target.value.replace(/\D/g, "");

    if (v.length >= 2) {
      e.target.value = v.substring(0, 2) + "/" + v.substring(2, 4);
    } else {
      e.target.value = v;
    }
  }
});