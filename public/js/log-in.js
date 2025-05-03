document.addEventListener("DOMContentLoaded", () => {
    // Check if user is already logged in
    if (localStorage.getItem("token")) {
      window.location.href = "/firstPage";
    }

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
    const loginContainer = document.getElementById("login-container");
    const forgotPasswordContainer = document.getElementById(
      "forgot-password-container"
    );
    const otpContainer = document.getElementById("otp-container");
    const resetPasswordContainer = document.getElementById(
      "reset-password-container"
    );

    // Forgot Password Link
    const forgotPasswordLink = document.getElementById(
      "forgot-password-link"
    );
    const backToLogin = document.getElementById("back-to-login");
    const backToForgot = document.getElementById("back-to-forgot");

    forgotPasswordLink.addEventListener("click", (e) => {
      e.preventDefault();
      loginContainer.classList.add("hidden");
      forgotPasswordContainer.classList.remove("hidden");
    });

    backToLogin.addEventListener("click", (e) => {
      e.preventDefault();
      forgotPasswordContainer.classList.add("hidden");
      loginContainer.classList.remove("hidden");
    });

    backToForgot.addEventListener("click", (e) => {
      e.preventDefault();
      otpContainer.classList.add("hidden");
      forgotPasswordContainer.classList.remove("hidden");
    });

    // Password Toggle for Login
    const toggleLoginPassword = document.getElementById(
      "toggle-login-password"
    );
    const loginPasswordInput = document.getElementById("login-password");
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

    toggleLoginPassword.addEventListener("click", () => {
      togglePasswordVisibility(loginPasswordInput, toggleLoginPassword);
    });

    // Password Toggle for Reset
    const toggleNewPassword = document.getElementById(
      "toggle-new-password"
    );
    const newPasswordInput = document.getElementById("new-password");
    const toggleConfirmPassword = document.getElementById(
      "toggle-confirm-password"
    );
    const confirmPasswordInput =
      document.getElementById("confirm-password");

    toggleNewPassword.addEventListener("click", () => {
      togglePasswordVisibility(newPasswordInput, toggleNewPassword);
    });

    toggleConfirmPassword.addEventListener("click", () => {
      togglePasswordVisibility(confirmPasswordInput, toggleConfirmPassword);
    });

    // Email Validation
    const loginEmailStatus = document.getElementById("login-email-status");
    const loginEmail = document.getElementById("login-email");

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

    loginEmail.addEventListener("input", () => {
      const isValid = isValidEmail(loginEmail.value);
      updateEmailStatus(
        loginEmail,
        loginEmailStatus,
        document.getElementById("login-email-error"),
        isValid
      );
    });

    const allowedEmails = [
      "sunilnp@acem.edu.in",
      "ofcsatyam007@gmail.com",
      "vanshajs11@gmail.com",
    ];

    // Login Form Submission
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
      loginForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const email = loginEmail.value;
        const password = loginPasswordInput.value;
        const emailError = document.getElementById("login-email-error");
        const passwordError = document.getElementById(
          "login-password-error"
        );

        let hasError = false;
        if (!email) {
          emailError.textContent = "Email is required";
          hasError = true;
        } else if (!isValidEmail(email)) {
          emailError.textContent = "Invalid email address";
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

        if (hasError) {
          showPopupMessage("Please fix the errors before logging in.");
          return;
        }

        // Send login request with user-provided credentials
        fetch("/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(
                "Login failed: Invalid credentials or server error"
              );
            }
            return response.json();
          })
          .then((data) => {
            if (data.token) {
              localStorage.setItem("token", data.token);
              localStorage.setItem("email", email);
              localStorage.setItem("isLoggedIn", "true");
              // Redirect based on email role
              if (allowedEmails.includes(email)) {
                window.location.href = "/admin";
              } else {
                window.location.href = "/firstPage";
              }
            } else {
              showPopupMessage(data.error || "Login failed");
            }
          })
          .catch((error) => {
            console.error("Login error:", error);
            showPopupMessage("Login failed: " + error.message);
          });
      });
    }

    // Forgot Password Submission
    const forgotPasswordForm = document.getElementById(
      "forgot-password-form"
    );
    let forgotEmailValue = "";
    if (forgotPasswordForm) {
      forgotPasswordForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const email = document.getElementById("forgot-email").value;
        const emailError = document.getElementById("forgot-email-error");

        if (!email || !isValidEmail(email)) {
          emailError.textContent = "Please enter a valid email";
        } else {
          emailError.textContent = "";
          forgotEmailValue = email;
          fetch("/forgot-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          })
            .then((response) => response.json())
            .then((data) => {
              if (data.message) {
                showPopupMessage("OTP sent to your email!");
                forgotPasswordContainer.classList.add("hidden");
                otpContainer.classList.remove("hidden");
              } else {
                showPopupMessage("Error sending OTP");
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

        fetch("/reset-password/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: forgotEmailValue, otp }),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.valid) {
              otpBlocks.forEach((block) => block.classList.add("valid"));
              showPopupMessage("OTP verified! Set your new password.");
              setTimeout(() => {
                otpContainer.classList.add("hidden");
                resetPasswordContainer.classList.remove("hidden");
              }, 1000);
            } else {
              otpBlocks.forEach((block) => block.classList.add("invalid"));
              otpError.textContent = "Invalid OTP";
              showPopupMessage("Invalid OTP");
            }
          })
          .catch((err) => showPopupMessage("Error: " + err.message));
      });
    }

    // Reset Password Submission
    const resetPasswordForm = document.getElementById(
      "reset-password-form"
    );
    if (resetPasswordForm) {
      resetPasswordForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const newPassword = document.getElementById("new-password").value;
        const confirmPassword =
          document.getElementById("confirm-password").value;
        const newPasswordError =
          document.getElementById("new-password-error");
        const confirmPasswordError = document.getElementById(
          "confirm-password-error"
        );

        let hasError = false;
        if (!newPassword) {
          newPasswordError.textContent = "New password is required";
          hasError = true;
        } else {
          newPasswordError.textContent = "";
        }

        if (!confirmPassword) {
          confirmPasswordError.textContent = "Confirm password is required";
          hasError = true;
        } else if (newPassword !== confirmPassword) {
          confirmPasswordError.textContent = "Passwords do not match";
          hasError = true;
        } else {
          confirmPasswordError.textContent = "";
        }

        if (hasError) {
          showPopupMessage("Please fix the errors before resetting.");
          return;
        }

        fetch("/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: forgotEmailValue,
            password: newPassword,
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.message) {
              showPopupMessage("Password reset successful! Please log in.");
              setTimeout(() => {
                resetPasswordContainer.classList.add("hidden");
                loginContainer.classList.remove("hidden");
              }, 1000);
            } else {
              showPopupMessage("Error resetting password");
            }
          })
          .catch((err) => showPopupMessage("Error: " + err.message));
      });
    }
  });