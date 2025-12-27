// --------------------
// Map Setup
// --------------------
const map = L.map("map").setView([26.4525, 87.2718], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

let routeA, routeB, hazardMarker;

// --------------------
// Main Logic
// --------------------
function findRoute() {
    const role = document.getElementById("role").value;

    clearMap();

    // Two demo routes
    const routeAcoords = [
        [26.4525, 87.2718],
        [26.4560, 87.2790],
        [26.4605, 87.2830]
    ];

    const routeBcoords = [
        [26.4525, 87.2718],
        [26.4510, 87.2795],
        [26.4550, 87.2865]
    ];

    routeA = L.polyline(routeAcoords, { color: "red", weight: 6 }).addTo(map);
    routeB = L.polyline(routeBcoords, { color: "green", weight: 6 }).addTo(map);

    map.fitBounds(L.featureGroup([routeA, routeB]).getBounds());

    // Simulated hazard
    const hazard = {
        type: "Flooding",
        reason: "Heavy rain + poor drainage",
        location: [26.4605, 87.2830]
    };

    hazardMarker = L.marker(hazard.location).addTo(map)
        .bindPopup(`⚠️ ${hazard.type}<br>${hazard.reason}`);

    // Role-based explanation
    let explanation = "";

    if (role === "ambulance") {
        explanation = `
        🚑 Ambulance priority:<br>
        Route A is avoided due to ${hazard.type}.<br>
        Route B is safer and more reliable.
        `;
    } else if (role === "delivery") {
        explanation = `
        📦 Delivery priority:<br>
        Route A is faster but risky (${hazard.type}).<br>
        Route B is safer but longer.
        `;
    } else if (role === "commuter") {
        explanation = `
        🧑‍💼 Commuter priority:<br>
        Route B balances safety and consistency.
        `;
    } else {
        explanation = `
        🏙 City Planner view:<br>
        Route A may cause disruption due to ${hazard.type}.<br>
        Route B reduces congestion risk.
        `;
    }

    document.getElementById("result").innerHTML = explanation;

    routeA.on("click", () => showWarning(hazard));
    routeB.on("click", () => showSafe());
}

// --------------------
function showWarning(hazard) {
    document.getElementById("result").innerHTML = `
    ⚠️ Risky Route Selected<br>
    Hazard: ${hazard.type}<br>
    Reason: ${hazard.reason}<br>
    Recommendation: Choose alternate route.
    `;
}

// --------------------
function showSafe() {
    document.getElementById("result").innerHTML = `
    ✅ Safe Route Selected<br>
    No major hazards detected.
    `;
}

// --------------------
function clearMap() {
    if (routeA) map.removeLayer(routeA);
    if (routeB) map.removeLayer(routeB);
    if (hazardMarker) map.removeLayer(hazardMarker);
}
