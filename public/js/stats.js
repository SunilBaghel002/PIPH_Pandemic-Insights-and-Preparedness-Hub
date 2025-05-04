let healthcareChart, economyChart, predictiveChart, statsDoughnut;
let pandemicData = {};

const apiKey = "ff96b9f361a74304950aeff92e607e7e"; // Replace with your News API key

// Mock economic data
const economicData = {
  USA: {
    labels: [
      "Jan 2020",
      "Apr 2020",
      "Jul 2020",
      "Oct 2020",
      "Jan 2021",
      "Apr 2021",
      "Jul 2021",
      "Oct 2021",
      "Jan 2022",
      "Apr 2022",
      "Jul 2022",
      "Oct 2022",
      "Dec 2022",
    ],
    stockPrices: [
      3200, 2800, 3000, 3100, 3400, 3600, 3800, 4000, 4100, 3900, 3700, 3800,
      3950,
    ],
    gdpPerCapita: [
      63000, 59000, 57000, 58000, 60000, 62000, 64000, 66000, 67000, 65000,
      63000, 64000, 66000,
    ],
    unemploymentRate: [
      3.5, 14.8, 10.2, 6.9, 6.3, 5.9, 5.4, 4.6, 3.9, 3.7, 3.6, 3.5, 3.4,
    ],
  },
  India: {
    labels: [
      "Jan 2020",
      "Apr 2020",
      "Jul 2020",
      "Oct 2020",
      "Jan 2021",
      "Apr 2021",
      "Jul 2021",
      "Oct 2021",
      "Jan 2022",
      "Apr 2022",
      "Jul 2022",
      "Oct 2022",
      "Dec 2022",
    ],
    stockPrices: [
      41000, 35000, 37000, 39000, 46000, 48000, 52000, 59000, 57000, 55000,
      58000, 61000, 62000,
    ],
    gdpPerCapita: [
      2100, 1900, 1800, 1850, 1950, 2000, 2050, 2100, 2150, 2100, 2150, 2200,
      2250,
    ],
    unemploymentRate: [
      7.1, 23.5, 11.0, 7.0, 6.5, 8.0, 6.8, 6.3, 6.1, 6.0, 5.8, 5.7, 5.6,
    ],
  },
};

function generateEconomicData() {
  const labels = [
    "Jan 2020",
    "Apr 2020",
    "Jul 2020",
    "Oct 2020",
    "Jan 2021",
    "Apr 2021",
    "Jul 2021",
    "Oct 2021",
    "Jan 2022",
    "Apr 2022",
    "Jul 2022",
    "Oct 2022",
    "Dec 2022",
  ];
  const stockPrices = labels.map(() => Math.floor(Math.random() * 2000) + 2000);
  const gdpPerCapita = labels.map(
    () => Math.floor(Math.random() * 5000) + 1000
  );
  const unemploymentRate = labels.map(() =>
    (Math.random() * 10 + 3).toFixed(1)
  );
  return { labels, stockPrices, gdpPerCapita, unemploymentRate };
}

// Fetch live COVID-19 data
async function fetchPandemicData(country = "global") {
  try {
    const url =
      country === "global"
        ? "https://disease.sh/v3/covid-19/all"
        : `https://disease.sh/v3/covid-19/countries/${country}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();
    pandemicData = data;
    updateStats(data);
    updateDoughnutChart(data);
  } catch (error) {
    console.error("Error fetching pandemic data:", error);
    showPopupMessage("Failed to load pandemic data.");
    updateStats({
      active: "N/A",
      tests: "N/A",
      recovered: "N/A",
      deaths: "N/A",
    });
    updateDoughnutChart({ active: 0, tests: 0, recovered: 0, deaths: 0 });
  }
}

function updateStats(data) {
  document.getElementById("live-cases-count").textContent =
    data.active !== undefined ? data.active.toLocaleString() : "N/A";
  document.getElementById("vaccinated-count").textContent =
    data.tests !== undefined ? data.tests.toLocaleString() : "N/A";
  document.getElementById("recovered-count").textContent =
    data.recovered !== undefined ? data.recovered.toLocaleString() : "N/A";
  document.getElementById("deaths-count").textContent =
    data.deaths !== undefined ? data.deaths.toLocaleString() : "N/A";
}

// Fetch historical data for predictive chart
async function fetchHistoricalData(country = "global") {
  try {
    const days =
      document.getElementById("time-filter").value === "all"
        ? 900
        : document.getElementById("time-filter").value;
    const url =
      country === "global"
        ? `https://disease.sh/v3/covid-19/historical/all?lastdays=${days}`
        : `https://disease.sh/v3/covid-19/historical/${country}?lastdays=${days}`;
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Historical data not available for ${country}.`);
      updatePredictiveChart(["No Data Available"], [0]);
      showPopupMessage(`Historical data not available for ${country}.`);
      return;
    }
    const data = await response.json();
    const timeline = country === "global" ? data : data.timeline;
    const dates = Object.keys(timeline.cases);
    const predLabels =
      days === "7" ? dates.slice(-7) : days === "30" ? dates.slice(-30) : dates;
    const predData = Object.values(timeline.cases).slice(
      dates.length - predLabels.length
    );
    updatePredictiveChart(predLabels, predData);
  } catch (error) {
    console.error("Error fetching historical data:", error);
    showPopupMessage("Failed to load historical data.");
    updatePredictiveChart(["Error"], [0]);
  }
}

// Fetch country from coordinates
async function fetchCountryFromCoordinates(lat, lon) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
    );
    const data = await response.json();
    if (data.address && data.address.country) {
      const country = data.address.country;
      fetchPandemicData(country);
      fetchHistoricalData(country);
      updateGraphs(country);
      selectCountryInDropdown(country);
    } else {
      throw new Error("Country data not found");
    }
  } catch (error) {
    console.error("Error fetching country:", error);
    fetchPandemicData("India");
    fetchHistoricalData("India");
    updateGraphs("India");
  }
}

function selectCountryInDropdown(country) {
  const select = document.getElementById("country-select");
  for (let option of select.options) {
    if (
      option.value.toLowerCase() === country.toLowerCase() ||
      option.text.toLowerCase() === country.toLowerCase()
    ) {
      select.value = option.value;
      break;
    }
  }
}

// Populate country dropdown
async function populateCountryDropdown() {
  try {
    const response = await fetch("https://disease.sh/v3/covid-19/countries");
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const countries = await response.json();
    const select = document.getElementById("country-select");
    select.innerHTML =
      '<option value="" disabled selected>Select a country</option>';
    countries.forEach((country) => {
      const option = document.createElement("option");
      option.value = country.country;
      option.textContent = country.country;
      select.appendChild(option);
    });
  } catch (error) {
    console.error("Error populating country dropdown:", error);
    showPopupMessage("Failed to load country list.");
  }
}

// Update graphs
function updateGraphs(country) {
  const healthcareLabels = [
    "Jan 2020",
    "Apr 2020",
    "Jul 2020",
    "Oct 2020",
    "Jan 2021",
    "Apr 2021",
    "Jul 2021",
    "Oct 2021",
    "Jan 2022",
    "Apr 2022",
    "Jul 2022",
    "Oct 2022",
    "Dec 2022",
  ];
  const healthcareCapacity = healthcareLabels.map(
    () => Math.floor(Math.random() * 30) + 60
  );
  healthcareChart.data.labels = healthcareLabels;
  healthcareChart.data.datasets[0].data = healthcareCapacity;
  healthcareChart.update();

  let econData = economicData[country] || generateEconomicData();
  economyChart.data.labels = econData.labels;
  economyChart.data.datasets[0].data = econData.stockPrices;
  economyChart.data.datasets[1].data = econData.gdpPerCapita.map(
    (g) => g / 1000
  );
  economyChart.data.datasets[2].data = econData.unemploymentRate;
  economyChart.update();
}

function updateDoughnutChart(data) {
  statsDoughnut.data.datasets[0].data = [
    data.active || 0,
    data.tests || 0,
    data.recovered || 0,
    data.deaths || 0,
  ];
  statsDoughnut.update();
}

// Chart Setup
document.addEventListener("DOMContentLoaded", () => {
  const ctx1 = document.getElementById("healthcare-chart").getContext("2d");
  healthcareChart = new Chart(ctx1, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Healthcare Capacity (%)",
          data: [],
          borderColor: "#00ffff",
          backgroundColor: "rgba(75, 94, 109, 0.2)",
          fill: true,
          tension: 0.3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { color: "#333" } }, // Dark grey for x-axis labels
        y: { ticks: { color: "#333" }, beginAtZero: true }, // Dark grey for y-axis labels
      },
      plugins: {
        legend: { labels: { color: "#333" } }, // Dark grey for legend
        title: {
          display: true,
          text: "Healthcare Capacity Over Time",
          color: "#1e40af", // Dark blue for title
          font: { size: 18 },
        },
        zoom: {
          zoom: {
            wheel: { enabled: true },
            pinch: { enabled: true },
            mode: "x",
          },
        },
      },
    },
  });

  const ctx2 = document.getElementById("economy-chart").getContext("2d");
  economyChart = new Chart(ctx2, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Stock Prices (Index)",
          data: [],
          borderColor: "#00ffff",
          fill: false,
          tension: 0.3,
          yAxisID: "y1",
        },
        {
          label: "GDP per Capita (k USD)",
          data: [],
          borderColor: "#00b7eb",
          fill: false,
          tension: 0.3,
          yAxisID: "y2",
        },
        {
          label: "Unemployment Rate (%)",
          data: [],
          borderColor: "#ff5555",
          fill: false,
          tension: 0.3,
          yAxisID: "y3",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { color: "#333" } }, // Dark grey for x-axis labels
        y1: {
          position: "left",
          ticks: { color: "#333" }, // Dark grey for y1-axis labels
          beginAtZero: false,
        },
        y2: {
          position: "right",
          ticks: { color: "#333" }, // Dark grey for y2-axis labels
          beginAtZero: false,
          grid: { drawOnChartArea: false },
        },
        y3: {
          position: "right",
          ticks: { color: "#333" }, // Dark grey for y3-axis labels
          beginAtZero: true,
          grid: { drawOnChartArea: false },
        },
      },
      plugins: {
        legend: { labels: { color: "#333" } }, // Dark grey for legend
        title: {
          display: true,
          text: "Economic Impact Over Time",
          color: "#1e40af", // Dark blue for title
          font: { size: 18 },
        },
        zoom: {
          zoom: {
            wheel: { enabled: true },
            pinch: { enabled: true },
            mode: "x",
          },
        },
      },
    },
  });

  const ctx3 = document.getElementById("predictive-chart").getContext("2d");
  predictiveChart = new Chart(ctx3, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Predicted Cases",
          data: [],
          borderColor: "#ff5555",
          backgroundColor: "rgba(75, 94, 109, 0.2)",
          fill: true,
          tension: 0.3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { color: "#333" } }, // Dark grey for x-axis labels
        y: { ticks: { color: "#333" }, beginAtZero: true }, // Dark grey for y-axis labels
      },
      plugins: {
        legend: { labels: { color: "#333" } }, // Dark grey for legend
        title: {
          display: true,
          text: "Predictive Case Trends",
          color: "#1e40af", // Dark blue for title
          font: { size: 18 },
        },
        zoom: {
          zoom: {
            wheel: { enabled: true },
            pinch: { enabled: true },
            mode: "x",
          },
        },
      },
    },
  });

  const ctx4 = document.getElementById("stats-doughnut").getContext("2d");
  statsDoughnut = new Chart(ctx4, {
    type: "doughnut",
    data: {
      labels: ["Live Cases", "Vaccinated", "Recovered", "Deaths"],
      datasets: [
        {
          data: [0, 0, 0, 0],
          backgroundColor: ["#ff9999", "#2ecc71", "#00ffff", "#e74c3c"],
          borderColor: "#000",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: "#333" } }, // Dark grey for legend
        title: {
          display: true,
          text: "Stats Distribution",
          color: "#1e40af", // Dark blue for title
          font: { size: 18 },
        },
      },
    },
  });

  // Initial load
  populateCountryDropdown().then(() => {
    getUserLocation();
    fetchPandemicData("India");
    fetchHistoricalData("India");
    updateGraphs("India");
  });

  // Polling for real-time updates (every 30 seconds)
  setInterval(() => {
    const country = document.getElementById("country-select").value || "India";
    fetchPandemicData(country);
  }, 30000);
});

document
  .getElementById("country-select")
  .addEventListener("change", (event) => {
    const selectedCountry = event.target.value;
    fetchPandemicData(selectedCountry);
    fetchHistoricalData(selectedCountry);
    updateGraphs(selectedCountry);
  });

document.getElementById("time-filter").addEventListener("change", (event) => {
  const selectedCountry =
    document.getElementById("country-select").value || "India";
  fetchHistoricalData(selectedCountry);
});

function getUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchCountryFromCoordinates(latitude, longitude);
      },
      () => {
        fetchPandemicData("India");
        fetchHistoricalData("India");
        updateGraphs("India");
      }
    );
  } else {
    fetchPandemicData("India");
    fetchHistoricalData("India");
    updateGraphs("India");
  }
}

function updatePredictiveChart(labels, data) {
  predictiveChart.data.labels = labels;
  predictiveChart.data.datasets[0].data = data;
  predictiveChart.update();
}

// Export Report as PDF
async function exportReport() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setTextColor(0, 255, 255); // Cyan text
  doc.text("Pandemic Impact Report", 10, 10);

  // Stats Table
  const statsData = [
    ["Live Cases", document.getElementById("live-cases-count").textContent],
    ["Vaccinated", document.getElementById("vaccinated-count").textContent],
    ["Recovered", document.getElementById("recovered-count").textContent],
    ["Deaths", document.getElementById("deaths-count").textContent],
  ];
  doc.autoTable({
    startY: 20,
    head: [["Metric", "Value"]],
    body: statsData,
    theme: "grid",
    styles: { textColor: [255, 255, 255], fillColor: [0, 0, 0] }, // White text, black background
    headStyles: { fillColor: [0, 255, 255], textColor: [0, 0, 0] }, // Cyan header, black text
  });

  // Graphs
  const charts = [
    "stats-doughnut",
    "healthcare-chart",
    "economy-chart",
    "predictive-chart",
  ];
  let yPos = doc.lastAutoTable.finalY + 10;
  for (const chartId of charts) {
    const canvas = document.getElementById(chartId);
    const imgData = canvas.toDataURL("image/png");
    doc.setTextColor(0, 255, 255);
    doc.text(
      `${chartId
        .replace("-chart", "")
        .replace("stats-doughnut", "Stats Distribution")} Graph`,
      10,
      yPos
    );
    doc.addImage(imgData, "PNG", 10, yPos + 10, 180, 90);
    yPos += 110;
    if (yPos > 280) {
      doc.addPage();
      yPos = 10;
    }
  }

  doc.save("pandemic_report.pdf");
}
