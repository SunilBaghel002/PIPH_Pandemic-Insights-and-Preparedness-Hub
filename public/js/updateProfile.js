let selectedFile = null;

// Enable editing for a given input field
function enableEdit(fieldId) {
  const input = document.getElementById(fieldId);
  if (input) {
    input.removeAttribute("disabled");
    input.focus();
  }
}

// Fetch the user profile from the backend and populate fields
async function fetchProfile() {
  const token = localStorage.getItem("token");
  if (!token) {
    showPopupMessage("Please log in to view your profile.");
    window.location.href = "/login";
    return;
  }
  try {
    const response = await fetch("http://localhost:5000/api/user/profile", {
      method: "GET",
      headers: { Authorization: token },
    });
    if (!response.ok) throw new Error("Failed to fetch profile");
    const data = await response.json();
    document.getElementById("fullName").value = data.name || "";
    document.getElementById("userName").value = data.username || "";
    document.getElementById("email").value = data.email || "";
    document.getElementById("phone").value = data.phone || "";
    if (data.photo) {
      document.getElementById("profilePic").src =
        "http://localhost:5000/" + data.photo;
    }
    // Update sidebar
    updateSidebarProfile(data);
    // Populate badges
    updateBadges(data);
  } catch (err) {
    console.error("Error fetching profile:", err);
    showPopupMessage("Error loading profile.");
  }
}

// Save changes by sending updated profile data to the backend
async function saveChanges() {
  const token = localStorage.getItem("token");
  if (!token) {
    showPopupMessage("Please log in to update your profile.");
    window.location.href = "/login";
    return;
  }
  const formData = new FormData();
  formData.append("fullName", document.getElementById("fullName").value);
  formData.append("userName", document.getElementById("userName").value);
  formData.append("email", document.getElementById("email").value);
  formData.append("phone", document.getElementById("phone").value);
  if (selectedFile) {
    formData.append("photo", selectedFile);
  }
  try {
    const response = await fetch("http://localhost:5000/api/user/update", {
      method: "POST",
      headers: { Authorization: token },
      body: formData,
    });
    const result = await response.json();
    if (response.ok) {
      showPopupMessage("Profile updated successfully!");
      fetchProfile(); // Refresh profile data
    } else {
      showPopupMessage(result.error || "Error updating profile.");
    }
  } catch (err) {
    console.error("Error updating profile:", err);
    showPopupMessage("Error updating profile.");
  }
}

// Cancel changes by re-fetching the profile data
function cancelChanges() {
  fetchProfile();
}

// Badge popup functions
function showBadgePopup(title, description) {
  document.getElementById("badgeTitle").textContent = title;
  document.getElementById("badgeDescription").textContent = description;
  document.getElementById("badgePopup").style.display = "flex";
}

function closePopup() {
  document.getElementById("badgePopup").style.display = "none";
}

// Image options functions
function showImageOptions() {
  const options = document.getElementById("imageOptions");
  options.style.display = options.style.display === "block" ? "none" : "block";
}

function viewImage() {
  const image = document.getElementById("profilePic");
  window.open(image.src, "_blank");
  document.getElementById("imageOptions").style.display = "none";
}

function updateImage() {
  const imageInput = document.createElement("input");
  imageInput.type = "file";
  imageInput.accept = "image/*";
  imageInput.onchange = function (event) {
    const file = event.target.files[0];
    if (file) {
      selectedFile = file;
      const reader = new FileReader();
      reader.onload = function (e) {
        document.getElementById("profilePic").src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };
  imageInput.click();
  document.getElementById("imageOptions").style.display = "none";
}

// Update sidebar profile (assumes sidebar.js has this)
function updateSidebarProfile(data) {
  const userPhoto = document.getElementById("user-photo");
  const userName = document.getElementById("user-name");
  const userEmail = document.getElementById("user-email");
  if (userPhoto && data.photo)
    userPhoto.src = "http://localhost:5000/" + data.photo;
  if (userName) userName.textContent = data.name || "User Name";
  if (userEmail) userEmail.textContent = data.email || "user@example.com";
}

// Update badges with seekbar
function updateBadges(data) {
  const badgesDiv = document.getElementById("badges");
  if (!badgesDiv) return;

  badgesDiv.innerHTML = "";
  const isOrgHead = data.isOrgHead || false; // From backend
  const tasksCompleted = data.tasksCompleted || 0;
  const taskMilestones = [5, 10, 20]; // Example milestones

  // Volunteer Badge with Seekbar
  const volunteerBadge = document.createElement("div");
  volunteerBadge.className = "badge-container";
  let nextMilestone =
    taskMilestones.find((m) => m > tasksCompleted) ||
    taskMilestones[taskMilestones.length - 1];
  let progress = (tasksCompleted / nextMilestone) * 100;
  volunteerBadge.innerHTML = `
                <div class="badge" onclick="showBadgePopup('Volunteer', 'Earned by completing tasks')">
                    <i class="fa-solid fa-handshake-angle"></i>
                </div>
                <div class="badge-info">
                    <span>Volunteer - ${tasksCompleted}/${nextMilestone} Tasks</span>
                    <span>${nextMilestone - tasksCompleted} more to go</span>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${progress}%"></div>
                    </div>
                </div>
            `;
  badgesDiv.appendChild(volunteerBadge);

  // Organization-Head Badge
  if (isOrgHead) {
    const orgHeadBadge = document.createElement("div");
    orgHeadBadge.className = "badge-container";
    orgHeadBadge.innerHTML = `
                    <div class="badge" onclick="showBadgePopup('Organization Head', 'Awarded for creating an organization')">
                        <i class="fa-solid fa-crown"></i>
                    </div>
                    <div class="badge-info">
                        <span>Organization Head</span>
                        <span>Creator of an organization</span>
                    </div>
                `;
    badgesDiv.appendChild(orgHeadBadge);
  }
}

// On page load, fetch the user profile data
document.addEventListener("DOMContentLoaded", function () {
  fetchProfile();
});
