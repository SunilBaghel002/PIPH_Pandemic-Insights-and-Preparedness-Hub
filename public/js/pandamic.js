const apiKey = "ff96b9f361a74304950aeff92e607e7e"; // Replace with your News API key
      let pollVotes = { yes: 0, no: 0 };
      let newsArticles = [];
      let savedArticles =
        JSON.parse(localStorage.getItem("savedArticles")) || [];

      // Real-Time News Ticker
      async function fetchNewsTicker() {
        try {
          const response = await fetch(
            `https://newsapi.org/v2/everything?q=pandemic OR COVID OR outbreak&language=en&sortBy=publishedAt&pageSize=5&apiKey=${apiKey}`
          );
          const data = await response.json();
          const ticker = document.getElementById("ticker-content");
          ticker.innerHTML = data.articles
            .map(
              (article) =>
                `<a href="${article.url}" target="_blank">${article.title}</a>`
            )
            .join(" • ");
        } catch (error) {
          console.error("Error fetching news ticker:", error);
          document.getElementById("ticker-content").innerHTML =
            "Unable to load news.";
        }
      }

      // Fetch News for Section
      async function fetchNews() {
        try {
          const response = await fetch(
            `https://newsapi.org/v2/everything?q=pandemic OR COVID OR outbreak OR vaccine OR health policy&language=en&sortBy=publishedAt&pageSize=9&apiKey=${apiKey}`
          );
          const data = await response.json();
          newsArticles = data.articles.map((article, index) => ({
            id: index,
            title: article.title,
            description: article.description || "No description available.",
            url: article.url,
            image: article.urlToImage || "https://thumbs.dreamstime.com/b/news-newspapers-folded-stacked-word-wooden-block-puzzle-dice-concept-newspaper-media-press-release-42301371.jpg",
            date: new Date(article.publishedAt).toLocaleDateString(),
            source: article.source.name,
            category: categorizeNews(article.title + " " + article.description),
          }));
          displayNews(newsArticles);
        } catch (error) {
          console.error("Error fetching news:", error);
          document.getElementById("news-grid").innerHTML =
            "<p>Unable to load news.</p>";
        }
      }

      function categorizeNews(content) {
        content = content.toLowerCase();
        if (content.includes("outbreak") || content.includes("cases"))
          return "outbreaks";
        if (content.includes("vaccine") || content.includes("vaccination"))
          return "vaccines";
        if (
          content.includes("policy") ||
          content.includes("guidelines") ||
          content.includes("mandate")
        )
          return "policies";
        return "all";
      }

      function displayNews(articles) {
        const grid = document.getElementById("news-grid");
        grid.innerHTML = "";
        articles.forEach((article) => {
          const card = document.createElement("div");
          card.className = "news-card";
          card.innerHTML = `
                    <img src="${article.image}" alt="${
            article.title
          }" onerror="this.src='https://thumbs.dreamstime.com/b/news-newspapers-folded-stacked-word-wooden-block-puzzle-dice-concept-newspaper-media-press-release-42301371.jpg'">
                    <h3>${article.title}</h3>
                    <p>${article.description}</p>
                    <div class="source-date">${article.source} - ${
            article.date
          }</div>
                    <div class="actions">
                        <a href="${
                          article.url
                        }" target="_blank" class="read-more">Read More</a>
                        <button class="bookmark ${
                          savedArticles.some((a) => a.id === article.id)
                            ? "saved"
                            : ""
                        }" onclick="toggleBookmark(${
            article.id
          })"><i class="fa-solid fa-heart"></i></button>
                    </div>
                `;
          grid.appendChild(card);
        });
      }

      function filterNews(category) {
        document
          .querySelectorAll(".news-filter-btn")
          .forEach((btn) => btn.classList.remove("active"));
        document
          .querySelector(`.news-filter-btn[data-filter="${category}"]`)
          .classList.add("active");
        const filtered =
          category === "all"
            ? newsArticles
            : newsArticles.filter((article) => article.category === category);
        displayNews(filtered);
      }

      function toggleBookmark(id) {
        const article = newsArticles.find((a) => a.id === id);
        const index = savedArticles.findIndex((a) => a.id === id);
        const bookmarkBtn = document.querySelector(
          `.bookmark[onclick="toggleBookmark(${id})"]`
        );
        if (index === -1) {
          savedArticles.push(article);
          bookmarkBtn.classList.add("saved");
          showPopupMessage("Article saved!");
        } else {
          savedArticles.splice(index, 1);
          bookmarkBtn.classList.remove("saved");
          showPopupMessage("Article removed from saved.");
        }
        localStorage.setItem("savedArticles", JSON.stringify(savedArticles));
      }

      function toggleNewsModal() {
        const modal = document.getElementById("news-modal");
        modal.style.display =
          modal.style.display === "block" ? "none" : "block";
      }

      function submitNews() {
        const title = document.getElementById("news-title").value.trim();
        const description = document
          .getElementById("news-description")
          .value.trim();
        if (title && description) {
          const newArticle = {
            id: newsArticles.length,
            title,
            description,
            url: "#",
            image: "https://thumbs.dreamstime.com/b/news-newspapers-folded-stacked-word-wooden-block-puzzle-dice-concept-newspaper-media-press-release-42301371.jpg",
            date: new Date().toLocaleDateString(),
            source: "User Submission",
            category: categorizeNews(title + " " + description),
          };
          newsArticles.unshift(newArticle); // Add to top
          displayNews(newsArticles);
          toggleNewsModal();
          document.getElementById("news-title").value = "";
          document.getElementById("news-description").value = "";
          showPopupMessage("News submitted! Awaiting moderation.");
        } else {
          showPopupMessage("Please fill in both title and description.");
        }
      }

      // Pandemic Status Indicator
      function updateStatusIndicator() {
        const statusText = document.getElementById("status-text");
        const indicator = document.getElementById("status-indicator");
        const status = Math.random() > 0.5 ? "Low Risk" : "Active Outbreak"; // Mock logic
        statusText.textContent = status;
        indicator.classList.remove("green", "red");
        indicator.classList.add(status === "Low Risk" ? "green" : "red");
      }

      // Myth vs. Fact Game
      function revealAnswer(card) {
        if (!card.classList.contains("revealed")) {
          card.classList.add("revealed");
          const answer = card.getAttribute("data-answer");
          card.innerHTML += `<p>${
            answer === "myth" ? "Myth: This is false!" : "Fact: This is true!"
          }</p>`;
        }
      }

      // User Polls
      function votePoll(option, choice) {
        if (!option.classList.contains("voted")) {
          pollVotes[choice]++;
          document
            .querySelectorAll(".poll-option")
            .forEach((opt) => opt.classList.add("voted"));
          const total = pollVotes.yes + pollVotes.no;
          const yesPercent = total
            ? Math.round((pollVotes.yes / total) * 100)
            : 0;
          const noPercent = total
            ? Math.round((pollVotes.no / total) * 100)
            : 0;
          document.getElementById(
            "poll-result"
          ).textContent = `Yes: ${yesPercent}% | No: ${noPercent}%`;
          document.getElementById("poll-result").style.display = "block";
        }
      }

      // Live Q&A Chat
      function toggleChat() {
        const chat = document.getElementById("chat-widget");
        chat.style.display = chat.style.display === "block" ? "none" : "block";
      }

      function sendChatMessage() {
        const input = document.getElementById("chat-input");
        const message = input.value.trim();
        if (message) {
          const chatBody = document.getElementById("chat-body");
          chatBody.innerHTML += `<p><strong>You:</strong> ${message}</p>`;
          const responses = {
            "how to wear a mask":
              "Cover your nose and mouth fully, ensuring no gaps.",
            handwashing: "Wash with soap for at least 40 seconds.",
            vaccine: "Check with your local health authority for updates.",
          };
          const reply =
            responses[message.toLowerCase()] ||
            "I’m not sure, but stay safe and check official sources!";
          setTimeout(() => {
            chatBody.innerHTML += `<p><strong>Assistant:</strong> ${reply}</p>`;
            chatBody.scrollTop = chatBody.scrollHeight;
          }, 1000);
          input.value = "";
        }
      }

      // Initialize
      document.addEventListener("DOMContentLoaded", () => {
        fetchNewsTicker();
        fetchNews();
        updateStatusIndicator();
        particlesJS("particles-js", {
          particles: {
            number: { value: 50 },
            color: { value: "#00ffff" },
            size: { value: 3 },
            line_linked: { enable: false },
          },
          interactivity: {
            detect_on: "canvas",
            events: { onhover: { enable: true, mode: "repulse" } },
          },
        });
      });