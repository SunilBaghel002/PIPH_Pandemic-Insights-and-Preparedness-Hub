const API_KEY = "0a692fbe0badf9cea966c1248fcbdae7"; // Replace with your OpenWeatherMap API key
let latitude, longitude;

// Weather background images object
const weatherBackgrounds = {
  Clear:
    "https://wallpapers.com/images/hd/clear-sky-background-szn3pq4e6b106qow.jpg",
  Clouds:
    "https://png.pngtree.com/thumb_back/fh260/background/20230930/pngtree-a-blue-sky-above-clouds-with-clouds-image_13313410.jpg",
  Rain: "https://t3.ftcdn.net/jpg/08/73/37/66/360_F_873376678_tz3v6yWOqd4m0Yt3WKQ5GdYAhoyYIkuv.jpg",
  Snow: "https://i.pinimg.com/736x/20/88/6c/20886ce215a8179b115f9675af93e2aa.jpg",
  Thunderstorm:
    "https://static.vecteezy.com/system/resources/thumbnails/026/907/456/small_2x/ai-generated-ai-generative-abstract-thunder-storm-energy-light-background-decoration-pattern-rexture-nature-flash-graphic-art-photo.jpg",
  Drizzle:
    "https://t4.ftcdn.net/jpg/02/60/93/27/360_F_260932748_mgPiC5JfjoEywY7rguXlGcpdVxOU7QLk.jpg",
  Mist: "https://plus.unsplash.com/premium_photo-1669613233557-1676c121fe73?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Zm9nfGVufDB8fDB8fHww",
  Haze: "https://img.freepik.com/free-photo/black-white-abstraction-wallpaper_95678-465.jpg",
  Fog: "https://png.pngtree.com/thumb_back/fh260/background/20220612/pngtree-cloud-fog-smoke-white-fog-black-and-white-image_1413039.jpg",
  Smoke:
    "https://images.unsplash.com/photo-1556388275-bb5585725aca?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8Nnx8fGVufDB8fHx8fA%3D%3D",
  Dust: "https://png.pngtree.com/thumb_back/fh260/background/20210515/pngtree-gray-abstract-cloud-fog-gold-particles-dust-background-image_715055.jpg",
  Sand: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcReiQE3Wno4iGpoZ0LhsosujAdWkivrHQ9Bnw&s",
  Ash: "https://img.freepik.com/free-photo/gray-grunge-surface-wall-texture-background_1017-18216.jpg",
  Squall:
    "https://t4.ftcdn.net/jpg/09/49/65/79/360_F_949657946_DAwkGnwAxHhzegVIxtCV19mPWtcX3OO5.jpg",
  Tornado:
    "https://t3.ftcdn.net/jpg/07/54/07/86/360_F_754078657_BmNi51BaSR92Ecbcl7CFCtQGOQoBn3uC.jpg",
  Default:
    "https://img.freepik.com/free-vector/gorgeous-clouds-background-with-blue-sky-design_1017-25501.jpg", // Fallback
};

// Crispy lines for widget
const alertLines = {
  danger: [
    "Stay indoors, it's a rough day!",
    "Hazardous conditions ahead—be safe!",
  ],
  moderate: [
    "Not the best day, stay cautious.",
    "Conditions are tricky, plan ahead.",
  ],
  safe: ["Perfect day to enjoy outdoors!", "Fresh air and sunshine await!"],
};

// Weather condition to image keyword mapping
function getWeatherKeyword(condition) {
  const map = {
    Clear: "Clear",
    Clouds: "Clouds",
    Rain: "Rain",
    Snow: "Snow",
    Thunderstorm: "Thunderstorm",
    Drizzle: "Drizzle",
    Mist: "Mist",
    Haze: "Haze",
    Fog: "Fog",
    Smoke: "Smoke",
    Dust: "Dust",
    Sand: "Sand",
    Ash: "Ash",
    Squall: "Squall",
    Tornado: "Tornado",
  };
  return map[condition] || "Default";
}

// Get user's location
navigator.geolocation.getCurrentPosition(
  (position) => {
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;
    fetchWeatherData();
    fetchAQIData();
  },
  (error) => {
    console.error("Geolocation error:", error);
    document.getElementById("widgetCity").textContent =
      "Unable to get location";
  }
);

// Fetch Weather Data
async function fetchWeatherData() {
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`;

  try {
    const weatherResponse = await fetch(weatherUrl);
    if (!weatherResponse.ok) throw new Error("Weather API error");
    const weatherData = await weatherResponse.json();
    const city = weatherData.name;
    const temp = weatherData.main.temp;
    const description = weatherData.weather[0].description;
    const icon = weatherData.weather[0].icon;
    const weatherAlert = getWeatherAlertLevel(temp);
    const weatherKeyword = getWeatherKeyword(weatherData.weather[0].main);

    // Update Widget
    document.getElementById("widgetCity").textContent = city;
    document.getElementById("widgetTemp").textContent = `${temp}°C`;
    document.getElementById("widgetDescription").textContent = description;
    document.getElementById(
      "widgetIcon"
    ).src = `http://openweathermap.org/img/wn/${icon}@2x.png`;
    document.getElementById(
      "widgetWeatherAlert"
    ).className = `alert-bar ${weatherAlert}`;
    document.getElementById("weatherImage").src =
      weatherBackgrounds[weatherKeyword];

    // Update Dashboard
    displayCurrentWeather(weatherData, weatherKeyword);
    displayAdditionalInfo(weatherData);

    const forecastResponse = await fetch(forecastUrl);
    if (!forecastResponse.ok) throw new Error("Forecast API error");
    const forecastData = await forecastResponse.json();
    displayForecast(forecastData);
    createTemperatureChart(forecastData);
    createWindChart(forecastData);

    setCrispyLine();
  } catch (error) {
    console.error("Weather fetch error:", error);
    document.getElementById("widgetCity").textContent = "Error";
  }
}

// Fetch AQI Data
async function fetchAQIData() {
  const aqiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;
  try {
    const aqiResponse = await fetch(aqiUrl);
    if (!aqiResponse.ok) throw new Error("AQI API error");
    const aqiData = await aqiResponse.json();
    const aqi = aqiData.list[0].main.aqi;
    const components = aqiData.list[0].components;
    const aqiAlert = getAQIAlertLevel(aqi);

    // Update Widget AQI
    document.getElementById(
      "widgetAQI"
    ).textContent = `AQI: ${aqi} | PM2.5: ${components.pm2_5} µg/m³`;
    document.getElementById(
      "widgetAQIAlert"
    ).className = `alert-bar ${aqiAlert}`;

    // Update Dashboard AQI
    displayAQI(aqiData);
    provideSuggestions(aqi, components);

    setCrispyLine();
  } catch (error) {
    console.error("AQI fetch error:", error);
    document.getElementById("widgetAQI").textContent =
      "AQI: Error | PM2.5: Error";
  }
}

// Alert Levels
function getWeatherAlertLevel(temp) {
  if (temp < 0 || temp > 35) return "danger";
  if (temp <= 10 || temp >= 25) return "moderate";
  return "safe";
}

function getAQIAlertLevel(aqi) {
  if (aqi <= 2) return "safe";
  if (aqi === 3) return "moderate";
  return "danger";
}

// Display Current Weather
function displayCurrentWeather(data, weatherKeyword) {
  const temp = data.main.temp;
  const feelsLike = data.main.feels_like;
  const description = data.weather[0].description;
  const icon = data.weather[0].icon;
  document.getElementById("currentWeather").innerHTML = `
                <h2>Current Weather in ${data.name}</h2>
                <div class="current-weather-content">
                    <div class="weather-details">
                        <div class="weather-box">
                            <img src="http://openweathermap.org/img/wn/${icon}@2x.png" alt="Weather Icon" style="width: 100px;">
                            <div>
                                <p>Temperature: ${temp}°C</p>
                                <p>Feels Like: ${feelsLike}°C</p>
                                <p>Condition: ${description}</p>
                            </div>
                        </div>
                    </div>
                    <img id="dashboardWeatherImage" class="dashboard-weather-image" src="${weatherBackgrounds[weatherKeyword]}" alt="Current Weather">
                </div>
            `;
}

// Additional Weather Info
function displayAdditionalInfo(data) {
  const humidity = data.main.humidity;
  const windSpeed = data.wind.speed;
  const windDirection = data.wind.deg;
  const pressure = data.main.pressure;
  const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
  const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString();
  const visibility = data.visibility / 1000; // Convert to km
  document.getElementById("additionalInfo").innerHTML = `
                <h2>Additional Details</h2>
                <div class="parameter-box">
                    <div class="param-item">Humidity: ${humidity}%</div>
                    <div class="param-item">Wind Speed: ${windSpeed} m/s</div>
                    <div class="param-item">Wind Direction: ${windDirection}°</div>
                    <div class="param-item">Pressure: ${pressure} hPa</div>
                    <div class="param-item">Visibility: ${visibility} km</div>
                    <div class="param-item">Sunrise: ${sunrise}</div>
                    <div class="param-item">Sunset: ${sunset}</div>
                </div>
            `;
}

// Display Forecast (cards)
function displayForecast(data) {
  const forecastContainer = document.getElementById("forecastContainer");
  forecastContainer.innerHTML = "";
  const dailyData = data.list.filter((item) =>
    item.dt_txt.includes("12:00:00")
  );
  dailyData.slice(0, 5).forEach((item) => {
    const date = new Date(item.dt * 1000).toLocaleDateString();
    const temp = item.main.temp;
    const description = item.weather[0].description;
    const icon = item.weather[0].icon;
    const wind = item.wind.speed;
    forecastContainer.innerHTML += `
                    <div class="forecast-card">
                        <p>${date}</p>
                        <img src="http://openweathermap.org/img/wn/${icon}@2x.png" alt="Weather Icon">
                        <p>${temp}°C</p>
                        <p>${description}</p>
                        <p>Wind: ${wind} m/s</p>
                    </div>
                `;
  });
}

// Create Temperature Chart
function createTemperatureChart(data) {
  const dailyData = data.list.filter((item) =>
    item.dt_txt.includes("12:00:00")
  );
  const labels = dailyData
    .slice(0, 5)
    .map((item) => new Date(item.dt * 1000).toLocaleDateString());
  const temps = dailyData.slice(0, 5).map((item) => item.main.temp);
  const ctx = document.getElementById("tempChart").getContext("2d");
  new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Temperature (°C)",
          data: temps,
          borderColor: "#00ddeb",
          backgroundColor: "rgba(0, 221, 235, 0.2)",
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: false, grid: { color: "rgba(255, 255, 255, 0.1)" } },
        x: {
          ticks: { maxRotation: 0, minRotation: 0, color: "#e0e0e0" },
          grid: { display: false },
        },
      },
      plugins: {
        legend: { labels: { color: "#e0e0e0" } },
      },
    },
  });
}

// Create Wind Speed Chart
function createWindChart(data) {
  const dailyData = data.list.filter((item) =>
    item.dt_txt.includes("12:00:00")
  );
  const labels = dailyData
    .slice(0, 5)
    .map((item) => new Date(item.dt * 1000).toLocaleDateString());
  const winds = dailyData.slice(0, 5).map((item) => item.wind.speed);
  const ctx = document.getElementById("windChart").getContext("2d");
  new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Wind Speed (m/s)",
          data: winds,
          borderColor: "#FFC107",
          backgroundColor: "rgba(255, 193, 7, 0.2)",
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: false, grid: { color: "rgba(255, 255, 255, 0.1)" } },
        x: {
          ticks: { maxRotation: 0, minRotation: 0, color: "#e0e0e0" },
          grid: { display: false },
        },
      },
      plugins: {
        legend: { labels: { color: "#e0e0e0" } },
      },
    },
  });
}

// Display AQI
function displayAQI(data) {
  const aqi = data.list[0].main.aqi;
  const components = data.list[0].components;
  const aqiLevels = ["Good", "Fair", "Moderate", "Poor", "Very Poor"];
  document.getElementById("aqiReport").innerHTML = `
                <h2>Air Quality Index</h2>
                <div class="parameter-box">
                    <div class="param-item">AQI: ${
                      aqiLevels[aqi - 1]
                    } (Level ${aqi})</div>
                    <div class="param-item">PM2.5: ${
                      components.pm2_5
                    } µg/m³</div>
                    <div class="param-item">PM10: ${components.pm10} µg/m³</div>
                    <div class="param-item">Ozone (O3): ${
                      components.o3
                    } µg/m³</div>
                    <div class="param-item">Carbon Monoxide (CO): ${
                      components.co
                    } µg/m³</div>
                    <div class="param-item">Sulfur Dioxide (SO2): ${
                      components.so2
                    } µg/m³</div>
                    <div class="param-item">Nitrogen Dioxide (NO2): ${
                      components.no2
                    } µg/m³</div>
                </div>
            `;
}

// Provide Suggestions
function provideSuggestions(aqi, components) {
  let suggestion = "";
  if (aqi >= 3) {
    suggestion +=
      "Air quality is moderate to poor. Consider staying indoors or wearing a mask.";
  } else {
    suggestion += "Air quality is good. Enjoy outdoor activities!";
  }
  if (components.pm2_5 > 25) {
    suggestion += " High PM2.5 levels—limit exposure.";
  }
  document.getElementById("suggestions").innerHTML = `
                <h2>Suggestions</h2>
                <p>${suggestion}</p>
            `;
}

// Set Crispy Line
function setCrispyLine() {
  const weatherAlert =
    document.getElementById("widgetWeatherAlert").className.split(" ")[1] ||
    "safe";
  const aqiAlert =
    document.getElementById("widgetAQIAlert").className.split(" ")[1] || "safe";
  const alertLevels = { safe: 0, moderate: 1, danger: 2 };
  const maxAlertVal = Math.max(
    alertLevels[weatherAlert],
    alertLevels[aqiAlert]
  );
  const alertKey = Object.keys(alertLevels).find(
    (key) => alertLevels[key] === maxAlertVal
  );
  const lines = alertLines[alertKey];
  const randomLine = lines[Math.floor(Math.random() * lines.length)];
  document.getElementById("crispyLine").textContent = randomLine;
}

// Show/Hide Dashboard
function showDashboard() {
  const dashboard = document.getElementById("weatherDashboard");
  dashboard.style.display = "block";
  setTimeout(() => {
    dashboard.style.opacity = "1";
    observeSections();
  }, 10);
  document.getElementById("weatherWidget").style.display = "none";
}

function hideDashboard() {
  const dashboard = document.getElementById("weatherDashboard");
  dashboard.style.opacity = "0";
  setTimeout(() => {
    dashboard.style.display = "none";
    document.getElementById("weatherWidget").style.display = "block";
  }, 300);
}

// Intersection Observer for scroll effects
function observeSections() {
  const sections = document.querySelectorAll(".dashboard-section");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.1 }
  );

  sections.forEach((section) => observer.observe(section));
}
document.getElementById("close-btn2").addEventListener("click", () => {
  document.getElementById("weatherWidget").style.display = "none";
});
