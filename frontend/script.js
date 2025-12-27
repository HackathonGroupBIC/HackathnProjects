// ==============================
// Map Initialization
// ==============================
const map = L.map("map").setView([26.4525, 87.2718], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

let routeA, routeB, hazardMarker;

// ==============================
// Main Function
// ==============================
function findRoute() {

    const role = document.getElementById("role").value;

    clearMap();

    // ------------------------------
    // Simulated Routes
    // ------------------------------
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

    routeA = L.polyline(routeAcoords, {
        color: "red",
        weight: 6
    }).addTo(map);

    routeB = L.polyline(routeBcoords, {
        color: "green",
        weight: 6
    }).addTo(map);

    map.fitBounds(L.featureGroup([routeA, routeB]).getBounds());

    // ------------------------------
    // Simulated Hazard (Fragmented Data)
    // ------------------------------
    const hazard = {
        type: "Flooding",
        reason: "Heavy rain + poor drainage",
        location: [26.4605, 87.2830]
    };

    hazardMarker = L.marker(hazard.location)
        .addTo(map)
        .bindPopup(`⚠️ ${hazard.type}<br>${hazard.reason}`);

    // ------------------------------
    // Role-Based Explanation
    // ------------------------------
    let explanation = "";

    if (role === "ambulance") {
        explanation = `
        🚑 <b>Ambulance Priority</b><br>
        Route A is risky due to flooding.<br>
        Route B is recommended for reliability and emergency access.
        `;
    }
    else if (role === "delivery") {
        explanation = `
        📦 <b>Delivery Priority</b><br>
        Route A is faster but risky (flooding).<br>
        Route B is safer but slower.
        `;
    }
    else if (role === "commuter") {
        explanation = `
        🧑‍💼 <b>Commuter Priority</b><br>
        Route B provides more consistent travel time.<br>
        Route A may cause delays.
        `;
    }
    else {
        explanation = `
        🏙 <b>City Planner View</b><br>
        Route A may increase disruption due to flooding.<br>
        Route B reduces congestion and improves fairness.
        `;
    }

    document.getElementById("result").innerHTML = explanation;

    // ------------------------------
    // Interaction
    // ------------------------------
    routeA.on("click", () => showRisk(hazard));
    routeB.on("click", () => showSafe());
}

// ==============================
// Helpers
// ==============================
function showRisk(hazard) {
    document.getElementById("result").innerHTML = `
    ⚠️ <b>Risky Route Selected</b><br>
    Hazard: ${hazard.type}<br>
    Reason: ${hazard.reason}<br>
    This route may become unusable if conditions worsen.
    `;
}

function showSafe() {
    document.getElementById("result").innerHTML = `
    ✅ <b>Safer Route Selected</b><br>
    No major hazards detected at this time.<br>
    Recommended based on current conditions.
    `;
}

function clearMap() {
    if (routeA) map.removeLayer(routeA);
    if (routeB) map.removeLayer(routeB);
    if (hazardMarker) map.removeLayer(hazardMarker);
}
