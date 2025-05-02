function handleGetStarted() {
    if (localStorage.getItem("isLoggedIn")) {
      location.href = "/request";
    } else {
      alert("Please log in or sign up to get started.");
      location.href = "/login";
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".protected-link").forEach((link) => {
      link.addEventListener("click", function (event) {
        if (!localStorage.getItem("isLoggedIn")) {
          event.preventDefault();
          alert("Please log in or sign up to access this page.");
          location.href = "/login";
        }
      });
    });

    const cards = document.querySelectorAll(".service-card");
    cards.forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;
        card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "rotateX(0deg) rotateY(0deg) scale(1)";
      });
    });
  });