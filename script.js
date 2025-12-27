// ==============================
// Map Initialization
// ==============================
const map = L.map("map", {
    worldCopyJump: true,
    maxZoom: 18,
    minZoom: 6
}).setView([28.3949, 84.1240], 7); // Nepal center

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

let routeA, routeB;
let startMarker, endMarker;
let hazardMarkers = [];

// ==============================
// Simulated Hazards (Frontend)
// ==============================
const simulatedHazards = [
    { type: "Flooding", reason: "Heavy rainfall reported" },
    { type: "Construction", reason: "Ongoing road maintenance" },
    { type: "Congestion", reason: "High traffic volume" }
];

// ==============================
// Hazard Icons
// ==============================
function getHazardIcon(type) {
    const icons = {
        Flooding: "🌊",
        Construction: "🚧",
        Congestion: "🚗",
        Accident: "💥"
    };

    return L.divIcon({
        html: `<div style="
            font-size:22px;
            background:white;
            border:2px solid #ff4d4d;
            border-radius:50%;
            width:34px;
            height:34px;
            display:flex;
            align-items:center;
            justify-content:center;
        ">${icons[type] || "⚠️"}</div>`
    });
}

// ==============================
// Nepal-only Geocoding
// ==============================
async function geocodeLocation(place) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
        place + ", Nepal"
    )}`;

    const response = await fetch(url, {
        headers: { "Accept-Language": "en" }
    });

    const data = await response.json();

    if (!data.length) {
        throw new Error(
            "Location not found in Nepal. Try a nearby area, road, or landmark."
        );
    }

    return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        display: data[0].display_name
    };
}

// ==============================
// MAIN FUNCTION
// ==============================
async function findRoute() {
    const startName = document.getElementById("start").value.trim();
    const endName = document.getElementById("end").value.trim();

    if (!startName || !endName) {
        alert("Please enter both start and destination locations.");
        return;
    }

    clearMap();

    try {
        // 1️⃣ Convert text to Nepal coordinates
        const start = await geocodeLocation(startName);
        const end = await geocodeLocation(endName);

        // 2️⃣ Zoom to start location
        map.setView([start.lat, start.lon], 11);

        // 3️⃣ Show exact markers
        startMarker = L.marker([start.lat, start.lon])
            .addTo(map)
            .bindPopup(`📍 Start<br>${start.display}`)
            .openPopup();

        endMarker = L.marker([end.lat, end.lon])
            .addTo(map)
            .bindPopup(`🏁 Destination<br>${end.display}`);

        // 4️⃣ Create two alternative routes
        const midLat = (start.lat + end.lat) / 2;
        const midLon = (start.lon + end.lon) / 2;

        const routeAcoords = [
            [start.lat, start.lon],
            [midLat + 0.15, midLon],
            [end.lat, end.lon]
        ];

        const routeBcoords = [
            [start.lat, start.lon],
            [midLat - 0.15, midLon],
            [end.lat, end.lon]
        ];

        routeA = L.polyline(routeAcoords, { color: "red", weight: 6 }).addTo(map);
        routeB = L.polyline(routeBcoords, { color: "green", weight: 6 }).addTo(map);

        map.fitBounds(L.featureGroup([routeA, routeB]).getBounds());

        // 5️⃣ Add hazards (simulated)
        simulatedHazards.forEach((hazard, i) => {
            const marker = L.marker(
                [midLat + i * 0.05, midLon - i * 0.05],
                { icon: getHazardIcon(hazard.type) }
            ).addTo(map);

            marker.bindPopup(`
                <b>${hazard.type}</b><br>
                ${hazard.reason}<br>
                <i>Simulated condition</i>
            `);

            hazardMarkers.push(marker);
        });

        // 6️⃣ Route explanation
        document.getElementById("result").innerHTML = `
<b>Two route options found:</b><br><br>
🔴 <b>Route A</b>: Faster but riskier due to road conditions.<br>
🟢 <b>Route B</b>: Safer and more reliable.<br><br>
Click a route on the map to select it.
        `;

        // 7️⃣ Route click behavior
        routeA.on("click", () => {
            document.getElementById("result").innerHTML = `
<div class="route-selected">
🔴 <b>Route A Selected</b><br>
Recommended when speed is critical.
</div>`;
        });

        routeB.on("click", () => {
            document.getElementById("result").innerHTML = `
<div class="route-selected">
🟢 <b>Route B Selected</b><br>
Recommended for safer and consistent travel.
</div>`;
        });

    } catch (error) {
        document.getElementById("result").innerHTML = `
<div class="uncertainty-box">
⚠️ ${error.message}<br><br>
Try examples like:<br>
• Biratnagar Bus Park<br>
• Main Road Biratnagar<br>
• Pokhara Lakeside
</div>`;
    }
}

// ==============================
// Cleanup
// ==============================
function clearMap() {
    if (routeA) map.removeLayer(routeA);
    if (routeB) map.removeLayer(routeB);

    if (startMarker) map.removeLayer(startMarker);
    if (endMarker) map.removeLayer(endMarker);

    hazardMarkers.forEach(marker => map.removeLayer(marker));
    hazardMarkers = [];
}
