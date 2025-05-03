// Sidebar Toggle Functions
function toggleSidebarMobile() {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("active");
}

// Update User Profile in Sidebar
function updateSidebarProfile() {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("http://localhost:5000/api/user/profile", {
        headers: { "Authorization": token }
    })
    .then(response => response.json())
    .then(data => {
        if (data.photo) {
            document.getElementById("user-photo").src = "http://localhost:5000/" + data.photo;
        }
        document.getElementById("user-name").textContent = data.name || "User Name";
        document.getElementById("user-email").textContent = data.email || "user@example.com";
    })
    .catch(err => console.error("Error fetching user profile: ", err));
}

// Highlight Active Link
function highlightActiveLink() {
    const currentPage = window.location.pathname;
    const sidebarLinks = document.querySelectorAll(".sidebar-link");
    sidebarLinks.forEach(link => {
        if (link.getAttribute("href") === currentPage) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });
}

// Close Sidebar on Link Click (Mobile)
document.querySelectorAll(".sidebar-link").forEach(link => {
    link.addEventListener("click", () => {
        if (window.innerWidth <= 768) {
            document.getElementById("sidebar").classList.remove("active");
        }
    });
});

// Close Sidebar on Outside Click (Mobile)
document.addEventListener("click", (e) => {
    const sidebar = document.getElementById("sidebar");
    const mobileToggle = document.querySelector(".mobile-toggle");
    if (
        window.innerWidth <= 768 &&
        e.target !== sidebar &&
        !sidebar.contains(e.target) &&
        e.target !== mobileToggle &&
        !mobileToggle.contains(e.target)
    ) {
        sidebar.classList.remove("active");
    }
});
// sidebar.js (partial example)
// Updated sidebar.js
document.addEventListener("DOMContentLoaded", () => {
    const userNameElement = document.getElementById("user-name");
    if (!userNameElement) {
      console.error("Element with ID 'user-name' not found in the DOM");
      return;
    }
  
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found, redirecting to login");
      window.location.href = "/login";
      return;
    }
  
    fetch("http://localhost:5000/api/user/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        userNameElement.textContent = data.name || "User Name";
      })
      .catch((error) => {
        console.error("Error fetching user profile:", error);
        userNameElement.textContent = "Guest"; // Fallback
      });
  });
  
  // Toggle sidebar for mobile (assuming this is also in sidebar.js)
  function toggleSidebarMobile() {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("active");
  }

// Initialize on Page Load
window.addEventListener("load", () => {
    updateSidebarProfile();
    highlightActiveLink();
});