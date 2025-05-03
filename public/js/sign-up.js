document.addEventListener("DOMContentLoaded", () => {
  // Popup elements
  const popup = document.getElementById("popup");
  const popupText = document.getElementById("popup-text");
  const closePopupButton = document.getElementById("close-popup");

  closePopupButton.addEventListener("click", () => {
    popup.style.display = "none";
  });

  function showPopupMessage(message) {
    popupText.textContent = message;
    popup.style.display = "flex";
    setTimeout(() => (popup.style.display = "none"), 3000);
  }

  // Containers
  const signupContainer = document.getElementById("signup-container");
  const otpContainer = document.getElementById("otp-container");

  // Password Toggle
  const toggleSignupPassword = document.getElementById(
    "toggle-signup-password"
  );
  const signupPasswordInput = document.getElementById("signup-password");
  const showPasswordIcon = "/images/show-password.png";
  const hidePasswordIcon = "/images/hide-password.png";

  function togglePasswordVisibility(input, toggleIcon) {
    if (input.type === "password") {
      input.type = "text";
      toggleIcon.src = hidePasswordIcon;
      toggleIcon.alt = "Hide Password";
    } else {
      input.type = "password";
      toggleIcon.src = showPasswordIcon;
      toggleIcon.alt = "Show Password";
    }
  }

  toggleSignupPassword.addEventListener("click", () => {
    togglePasswordVisibility(signupPasswordInput, toggleSignupPassword);
  });

  // Email Validation
  const signupEmailStatus = document.getElementById("signup-email-status");
  const signupEmail = document.getElementById("signup-email");

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function updateEmailStatus(input, statusIcon, errorElement, isValid) {
    if (isValid) {
      errorElement.textContent = "";
      statusIcon.style.display = "inline";
    } else {
      errorElement.textContent = "Invalid email address";
      statusIcon.style.display = "none";
    }
  }

  signupEmail.addEventListener("input", () => {
    const isValid = isValidEmail(signupEmail.value);
    updateEmailStatus(
      signupEmail,
      signupEmailStatus,
      document.getElementById("signup-email-error"),
      isValid
    );
  });

  // Sign-Up Form Submission
  const signupForm = document.getElementById("signup-form");
  let signupData = {};

  if (signupForm) {
    signupForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const name = document.getElementById("signup-name").value;
      const email = signupEmail.value;
      const password = signupPasswordInput.value;
      const phone =
        document.getElementById("country-code").value +
        document.getElementById("signup-phone").value;
      const dob = document.getElementById("signup-dob").value;

      const nameError = document.getElementById("signup-name-error");
      const emailError = document.getElementById("signup-email-error");
      const passwordError = document.getElementById("signup-password-error");
      const phoneError = document.getElementById("signup-phone-error");
      const dobError = document.getElementById("signup-dob-error");

      let hasError = false;
      if (!name) {
        nameError.textContent = "Name is required";
        hasError = true;
      } else {
        nameError.textContent = "";
      }

      if (!email || !isValidEmail(email)) {
        emailError.textContent = "Valid email is required";
        hasError = true;
      } else {
        emailError.textContent = "";
      }

      if (!password) {
        passwordError.textContent = "Password is required";
        hasError = true;
      } else {
        passwordError.textContent = "";
      }

      if (!phone || phone.length < 10) {
        phoneError.textContent = "Valid phone number is required";
        hasError = true;
      } else {
        phoneError.textContent = "";
      }

      if (!dob) {
        dobError.textContent = "Date of birth is required";
        hasError = true;
      } else {
        dobError.textContent = "";
      }

      if (hasError) {
        showPopupMessage("Please fix the errors before signing up.");
      } else {
        signupData = { name, email, password, phone, dob };
        fetch("/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.message) {
              showPopupMessage("OTP sent to your email!");
              signupContainer.classList.add("hidden");
              otpContainer.classList.remove("hidden");
            } else {
              showPopupMessage(data.error || "Error during signup");
            }
          })
          .catch((err) => showPopupMessage("Error: " + err.message));
      }
    });
  }

  // OTP Verification
  const otpForm = document.getElementById("otp-form");
  const otpBlocks = document.querySelectorAll(".otp-block");

  otpBlocks.forEach((block, index) => {
    block.addEventListener("input", (e) => {
      if (e.target.value.length === 1 && index < otpBlocks.length - 1) {
        otpBlocks[index + 1].focus();
      }
    });
    block.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !e.target.value && index > 0) {
        otpBlocks[index - 1].focus();
      }
    });
  });

  if (otpForm) {
    otpForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const otp = Array.from(otpBlocks)
        .map((block) => block.value)
        .join("");
      const otpError = document.getElementById("otp-error");

      if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
        otpError.textContent = "Please enter a valid 6-digit OTP";
        otpBlocks.forEach((block) => block.classList.add("invalid"));
        return;
      }

      fetch("/register/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: signupData.email,
          otp,
          password: signupData.password,
          name: signupData.name,
          phone: signupData.phone,
          dob: signupData.dob,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.token) {
            otpBlocks.forEach((block) => block.classList.add("valid"));
            showPopupMessage("Sign-up successful! Redirecting...");
            localStorage.setItem("token", data.token);
            setTimeout(() => (window.location.href = "/firstPage"), 1000);
          } else {
            otpBlocks.forEach((block) => block.classList.add("invalid"));
            otpError.textContent = "Invalid OTP";
            showPopupMessage(data.error || "OTP verification failed");
          }
        })
        .catch((err) => showPopupMessage("Error: " + err.message));
    });
  }

  // Resend OTP
  const resendOtpLink = document.getElementById("resend-otp");
  if (resendOtpLink) {
    resendOtpLink.addEventListener("click", (e) => {
      e.preventDefault();
      fetch("/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: signupData.email,
          password: signupData.password,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.message) {
            showPopupMessage("OTP resent to your email!");
            otpBlocks.forEach((block) => {
              block.value = "";
              block.classList.remove("valid", "invalid");
            });
          } else {
            showPopupMessage(data.error || "Error resending OTP");
          }
        })
        .catch((err) => showPopupMessage("Error: " + err.message));
    });
  }
});
