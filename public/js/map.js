const apiKey = "foJwrzIhpx6buK7dBC0P"; // MapTiler API Key
let map, marker, routingControl;
let currentLat, currentLon;
let ws;
let isAlertProcessing = false;
let isRouteProcessing = false;
const favorites = JSON.parse(localStorage.getItem("hospitalFavorites")) || [];
const alertSound = new Audio("/bell.mp3");
const allowedEmails = [
  "sunilnp@acem.edu.in",
  "ofcsatyam007@gmail.com",
  "vanshajs11@gmail.com",
];

const hospitalIcon = L.icon({
  iconUrl: "/images/hospital.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const highlightedIcon = L.icon({
  iconUrl: "/images/hospital.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

function showPopupMessage(message) {
  const popup = document.getElementById("popup");
  const popupText = document.getElementById("popup-text");
  popupText.textContent = message;
  popup.style.display = "block";
  document.querySelector(".grey").style.display = "block";
  setTimeout(() => {
    popup.style.display = "none";
    document.querySelector(".grey").style.display = "none";
  }, 3000);
}

function connectWebSocket() {
  ws = new WebSocket("ws://localhost:5000");

  ws.onopen = () => {
    console.log("Connected to WebSocket server");
    document.getElementById("info").textContent = "WebSocket connected.";
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === "alert") {
      const hospitalLi = document.querySelector(
        `li[data-id="${data.hospitalId}"]`
      );
      if (hospitalLi) {
        hospitalLi.querySelector(".status").textContent = "Alerted";
        hospitalLi.style.backgroundColor = "#fff3cd";
      }
    }
  };

  ws.onclose = () => {
    console.log("WebSocket disconnected. Reconnecting...");
    document.getElementById("info").textContent =
      "WebSocket disconnected. Reconnecting...";
    setTimeout(connectWebSocket, 3000);
  };

  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
    document.getElementById("info").textContent =
      "WebSocket error. Check console.";
  };
}

function sendAlert(hospitalId, hospitalName) {
  return new Promise((resolve, reject) => {
    if (ws.readyState !== WebSocket.OPEN) {
      showPopupMessage("WebSocket not connected. Please try again.");
      reject(new Error("WebSocket not connected"));
      return;
    }

    const userEmail = localStorage.getItem("email") || "anonymous";
    const alertId = Date.now().toString();
    const alertMessage = "Emergency alert from user";

    ws.send(
      JSON.stringify({
        type: "alert",
        hospitalId,
        userEmail,
        alertMessage,
        alertId,
      })
    );

    const onMessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "alert_ack" && data.alertId === alertId) {
        showPopupMessage(`Alert sent to ${hospitalName} and acknowledged!`);
        ws.removeEventListener("message", onMessage);
        resolve();
      }
    };

    ws.addEventListener("message", onMessage);

    setTimeout(() => {
      ws.removeEventListener("message", onMessage);
      showPopupMessage(
        `No acknowledgment from ${hospitalName}. Alert may not have been received.`
      );
      reject(new Error("No acknowledgment"));
    }, 5000);
  });
}

async function fetchHospitalAddress(lat, lon, retries = 3, delay = 1000) {
  const cacheKey = `address_${lat}_${lon}`;
  const cachedAddress = localStorage.getItem(cacheKey);
  if (cachedAddress) {
    return cachedAddress;
  }

  try {
    const response = await fetch(
      `http://localhost:5000/api/reverse?lat=${lat}&lon=${lon}`
    );
    if (response.status === 429 && retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchHospitalAddress(lat, lon, retries - 1, delay * 2);
    }
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    const address = data.display_name || "Address not available";
    localStorage.setItem(cacheKey, address);
    return address;
  } catch (error) {
    console.error("Error fetching address:", error);
    return "Address not available";
  }
}

async function getAddressFromCoordinates(lat, lon) {
  const address = await fetchHospitalAddress(lat, lon);
  document.getElementById("info").textContent = address;
}

function showRoute(hospLat, hospLon, hospName) {
  const cacheKey = `route_${currentLat}_${currentLon}_${hospLat}_${hospLon}`;
  const cachedRoute = localStorage.getItem(cacheKey);

  if (cachedRoute) {
    const { distanceKm } = JSON.parse(cachedRoute);
    document.getElementById(
      "route-distance"
    ).textContent = `Distance to ${hospName}: ${distanceKm} km`;
    document.getElementById("route-info").style.display = "block";
    if (routingControl) {
      routingControl.setWaypoints([
        L.latLng(currentLat, currentLon),
        L.latLng(hospLat, hospLon),
      ]);
    } else {
      routingControl = L.Routing.control({
        waypoints: [
          L.latLng(currentLat, currentLon),
          L.latLng(hospLat, hospLon),
        ],
        lineOptions: { styles: [{ color: "#2563eb", weight: 5 }] },
        router: L.Routing.osrmv1({
          serviceUrl: "https://router.project-osrm.org/route/v1",
        }),
        createMarker: (i, wp) =>
          i === 1
            ? L.marker(wp.latLng, { icon: highlightedIcon })
            : L.marker(wp.latLng),
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        showAlternatives: false,
      }).addTo(map);
    }
    return;
  }

  if (!currentLat || !currentLon) {
    showPopupMessage("Current location not available.");
    return;
  }

  if (routingControl) {
    routingControl.setWaypoints([
      L.latLng(currentLat, currentLon),
      L.latLng(hospLat, hospLon),
    ]);
  } else {
    routingControl = L.Routing.control({
      waypoints: [L.latLng(currentLat, currentLon), L.latLng(hospLat, hospLon)],
      lineOptions: { styles: [{ color: "#2563eb", weight: 5 }] },
      router: L.Routing.osrmv1({
        serviceUrl: "https://router.project-osrm.org/route/v1",
      }),
      createMarker: (i, wp) =>
        i === 1
          ? L.marker(wp.latLng, { icon: highlightedIcon })
          : L.marker(wp.latLng),
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: false,
    }).addTo(map);

    routingControl.on("routesfound", (e) => {
      const distanceKm = (e.routes[0].summary.totalDistance / 1000).toFixed(2);
      document.getElementById(
        "route-distance"
      ).textContent = `Distance to ${hospName}: ${distanceKm} km`;
      document.getElementById("route-info").style.display = "block";
      localStorage.setItem(cacheKey, JSON.stringify({ distanceKm }));
    });

    routingControl.on("routingerror", (e) => {
      showPopupMessage("Failed to calculate route. Please try again.");
      console.error("Routing error:", e);
    });
  }
}

async function getNearestHospitals(lat, lon) {
  if (!lat || !lon) {
    showPopupMessage("Location not determined yet.");
    return;
  }
  document.getElementById("info").textContent = "Fetching hospitals...";
  const radius = 10000;
  const searchQuery = document
    .getElementById("hospital-search")
    .value.trim()
    .toLowerCase();
  const filterType = document.getElementById("hospital-filter").value;
  const overpassQuery = `[out:json];(node["amenity"="hospital"](around:${radius},${lat},${lon}););out body;`;

  try {
    const response = await fetch(
      `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(
        overpassQuery
      )}`
    );
    const data = await response.json();
    const hospitalList = document.getElementById("hospital-list");
    hospitalList.innerHTML = "";

    if (!data.elements || data.elements.length === 0) {
      hospitalList.innerHTML = "<li>No hospitals found nearby.</li>";
      document.getElementById("info").textContent = "No hospitals found.";
      return;
    }

    const hospitals = [];
    for (const hospital of data.elements.slice(0, 5)) {
      const name = hospital.tags.name || "Unknown Hospital";
      const hospLat = hospital.lat;
      const hospLon = hospital.lon;
      const directDistance = (
        L.latLng(lat, lon).distanceTo(L.latLng(hospLat, hospLon)) / 1000
      ).toFixed(2);
      const address = await fetchHospitalAddress(hospLat, hospLon);
      const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${lat},${lon}&destination=${hospLat},${hospLon}&travelmode=driving`;
      const type =
        hospital.tags.type || (Math.random() > 0.5 ? "government" : "private");
      const id = hospital.id;

      hospitals.push({
        id,
        name,
        lat: hospLat,
        lon: hospLon,
        distance: directDistance,
        address,
        directionsUrl,
        type,
      });

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    const filteredHospitals = hospitals.filter((h) => {
      const matchesSearch =
        !searchQuery || h.name.toLowerCase().includes(searchQuery);
      const matchesFilter = !filterType || h.type === filterType;
      return matchesSearch && matchesFilter;
    });

    filteredHospitals.forEach((hospital) => {
      const li = document.createElement("li");
      li.dataset.id = hospital.id;
      li.innerHTML = `
        <strong>${hospital.name}</strong>
        <p>${hospital.address}</p>
        <p>Distance: ${hospital.distance} km</p>
        <p>Status: <span class="status">Normal</span></p>
        <a href="${hospital.directionsUrl}" target="_blank">🗺 Directions</a>
        <button class="alert-hospital" data-id="${hospital.id}" data-name="${hospital.name}">
          <span class="button-text">Send Alert</span>
          <span class="ringing-bell" style="display:none">🔔</span>
          <span class="loading" style="display:none">⏳</span>
        </button>
        <button class="route-hospital" data-lat="${hospital.lat}" data-lon="${hospital.lon}" data-name="${hospital.name}">
          <span class="button-text">Show Route</span>
          <span class="loading" style="display:none">⏳</span>
        </button>
        <button class="favorite-hospital" data-lat="${hospital.lat}" data-lon="${hospital.lon}" data-name="${hospital.name}">Favorite</button>
      `;
      hospitalList.appendChild(li);

      L.marker([hospital.lat, hospital.lon], {
        icon: hospitalIcon,
      }).addTo(map).bindPopup(`
          <strong>${hospital.name}</strong><br>
          ${hospital.address}<br>
          Distance: ${hospital.distance} km<br>
          <a href="${hospital.directionsUrl}" target="_blank">🗺 Directions</a>
        `);
    });

    document.getElementById("info").textContent = "Hospitals loaded.";
    updateFavoritesPanel();
  } catch (error) {
    console.error("Error fetching hospitals:", error);
    showPopupMessage("Error fetching hospital data.");
  }
}

function initMap(lat, lon) {
  map = L.map("map").setView([lat, lon], 13);
  L.tileLayer(
    `https://api.maptiler.com/maps/streets/256/{z}/{x}/{y}.png?key=${apiKey}`,
    {
      attribution: "© MapTiler © OpenStreetMap contributors",
    }
  ).addTo(map);
}

function changeMap(type) {
  let url;
  if (type === "streets")
    url = `https://api.maptiler.com/maps/streets/256/{z}/{x}/{y}.png?key=${apiKey}`;
  else if (type === "satellite")
    url = `https://api.maptiler.com/maps/satellite/256/{z}/{x}/{y}.jpg?key=${apiKey}`;
  else if (type === "hybrid")
    url = `https://api.maptiler.com/maps/hybrid/256/{z}/{x}/{y}.jpg?key=${apiKey}`;
  L.tileLayer(url, {
    attribution: "© MapTiler © OpenStreetMap contributors",
  }).addTo(map);
}

function getLocation() {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        currentLat = position.coords.latitude;
        currentLon = position.coords.longitude;
        document.getElementById("info").textContent =
          "Fetching your address...";
        getAddressFromCoordinates(currentLat, currentLon);
        if (!map) initMap(currentLat, currentLon);
        if (marker) map.removeLayer(marker);
        marker = L.marker([currentLat, currentLon])
          .addTo(map)
          .bindPopup("📍 You are here!")
          .openPopup();
        getNearestHospitals(currentLat, currentLon);
      },
      (error) => {
        console.error("Error getting location:", error);
        showPopupMessage("Unable to retrieve location.");
      },
      { enableHighAccuracy: true }
    );
  } else {
    showPopupMessage("Geolocation not supported.");
  }
}

function updateFavoritesPanel() {
  const favoritesList = document.getElementById("favorites-list");
  const panel = document.getElementById("favorites-panel");
  if (favorites.length > 0) {
    panel.style.display = "block";
    favoritesList.innerHTML = "";
    favorites.forEach((fav) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${fav.name}</strong>
        <button class="remove-favorite" data-name="${fav.name}" data-lat="${fav.lat}">Remove</button>
        <button class="route-favorite" data-lat="${fav.lat}" data-lon="${fav.lon}" data-name="${fav.name}">Route</button>
      `;
      favoritesList.appendChild(li);
    });
  } else {
    panel.style.display = "none";
  }
}

function clearFavorites() {
  favorites.length = 0;
  localStorage.setItem("hospitalFavorites", JSON.stringify(favorites));
  updateFavoritesPanel();
  showPopupMessage("Favorites cleared");
}

function closeRouteInfo() {
  document.getElementById("route-info").style.display = "none";
  if (routingControl) {
    map.removeControl(routingControl);
    routingControl = null;
  }
}

function makeDraggable(el) {
  let pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;
  el.onmousedown = dragMouseDown;
  function dragMouseDown(e) {
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }
  function elementDrag(e) {
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    el.style.top = el.offsetTop - pos2 + "px";
    el.style.left = el.offsetLeft - pos1 + "px";
  }
  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

function updateSidebar() {
  const userEmail = localStorage.getItem("email");
  const sidebarLinks = document.getElementById("sidebar-links");
  if (allowedEmails.includes(userEmail)) {
    sidebarLinks.innerHTML += `
      <a href="/hospital-dashboard" class="sidebar-link"><i class="fa-solid fa-hospital-user"></i> Hospital Dashboard</a>
      <a href="/admin" class="sidebar-link"><i class="fa-solid fa-cogs"></i> Manage Requests</a>
    `;
  }
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  connectWebSocket();
  getLocation();
  makeDraggable(document.getElementById("route-info"));
  makeDraggable(document.getElementById("favorites-panel"));
  updateFavoritesPanel();
  updateSidebar();
});

document.getElementById("find-hospitals").addEventListener("click", () => {
  if (currentLat && currentLon) {
    getNearestHospitals(currentLat, currentLon);
  } else {
    showPopupMessage("Please get your location first.");
  }
});

let debounceTimeout;
document.getElementById("hospital-search").addEventListener("input", () => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    if (currentLat && currentLon) getNearestHospitals(currentLat, currentLon);
  }, 500);
});

document.getElementById("hospital-filter").addEventListener("change", () => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    if (currentLat && currentLon) getNearestHospitals(currentLat, currentLon);
  }, 500);
});

document.getElementById("close-popup").addEventListener("click", () => {
  document.getElementById("popup").style.display = "none";
  document.querySelector(".grey").style.display = "none";
});

document.addEventListener("click", (event) => {
  if (event.target.classList.contains("alert-hospital") && !isAlertProcessing) {
    isAlertProcessing = true;
    const btn = event.target;
    const hospitalId = btn.getAttribute("data-id");
    const hospName = btn.getAttribute("data-name");

    const bellIcon = btn.querySelector(".ringing-bell");
    const loadingIcon = btn.querySelector(".loading");
    const buttonText = btn.querySelector(".button-text");

    buttonText.style.display = "none";
    loadingIcon.style.display = "inline";
    btn.disabled = true;

    alertSound.play();
    sendAlert(hospitalId, hospName)
      .then(() => {
        const hospitalLi = document.querySelector(
          `li[data-id="${hospitalId}"]`
        );
        if (hospitalLi) {
          hospitalLi.querySelector(".status").textContent = "Alerted";
          hospitalLi.style.backgroundColor = "#fff3cd";
        }
        loadingIcon.style.display = "none";
        bellIcon.style.display = "inline-block";
        setTimeout(() => {
          bellIcon.style.display = "none";
          buttonText.style.display = "inline";
          btn.disabled = false;
        }, 1500);
      })
      .catch((error) => {
        console.error("Alert failed:", error);
        loadingIcon.style.display = "none";
        buttonText.style.display = "inline";
        btn.disabled = false;
      })
      .finally(() => {
        setTimeout(() => (isAlertProcessing = false), 1000);
      });
  }

  if (event.target.classList.contains("route-hospital") && !isRouteProcessing) {
    isRouteProcessing = true;
    const btn = event.target;
    const hospLat = btn.getAttribute("data-lat");
    const hospLon = btn.getAttribute("data-lon");
    const hospName = btn.getAttribute("data-name");

    const loadingIcon = btn.querySelector(".loading");
    const buttonText = btn.querySelector(".button-text");

    buttonText.style.display = "none";
    loadingIcon.style.display = "inline";
    btn.disabled = true;

    showRoute(hospLat, hospLon, hospName);
    setTimeout(() => {
      loadingIcon.style.display = "none";
      buttonText.style.display = "inline";
      btn.disabled = false;
      isRouteProcessing = false;
    }, 1000);
  }

  if (event.target.classList.contains("favorite-hospital")) {
    const hospLat = event.target.getAttribute("data-lat");
    const hospLon = event.target.getAttribute("data-lon");
    const hospName = event.target.getAttribute("data-name");

    if (!favorites.find((h) => h.name === hospName && h.lat === hospLat)) {
      favorites.push({ name: hospName, lat: hospLat, lon: hospLon });
      localStorage.setItem("hospitalFavorites", JSON.stringify(favorites));
      updateFavoritesPanel();
      showPopupMessage(`${hospName} added to favorites`);
    } else {
      showPopupMessage(`${hospName} is already in favorites`);
    }
  }

  if (event.target.classList.contains("remove-favorite")) {
    const name = event.target.getAttribute("data-name");
    const lat = event.target.getAttribute("data-lat");
    const index = favorites.findIndex((h) => h.name === name && h.lat === lat);
    if (index !== -1) {
      favorites.splice(index, 1);
      localStorage.setItem("hospitalFavorites", JSON.stringify(favorites));
      updateFavoritesPanel();
      showPopupMessage(`${name} removed from favorites`);
    }
  }

  if (event.target.classList.contains("route-favorite")) {
    const hospLat = event.target.getAttribute("data-lat");
    const hospLon = event.target.getAttribute("data-lon");
    const hospName = event.target.getAttribute("data-name");
    showRoute(hospLat, hospLon, hospName);
  }
});
