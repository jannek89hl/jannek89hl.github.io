// Initialize the map
const map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -2,
    maxZoom: 2,
});

const bounds = [[0, 0], [2200, 2200]];
const mapImagePath = '10-5-24.png';

// Add the map image overlay
L.imageOverlay(mapImagePath, bounds).addTo(map);
map.fitBounds(bounds);

// Marker setup
const marker = L.marker([1100, 1100], { draggable: true }).addTo(map);
marker.bindPopup("Drag me to set the explosion center!").openPopup();

// Get GUI elements
const presetSelect = document.getElementById("preset");
const customInput = document.getElementById("custom-input");
const customKtInput = document.getElementById("custom-kt");
const detonateButton = document.getElementById("detonate");
const clearAllButton = document.getElementById("clear-all");
const detailsDiv = document.getElementById("details");

// Show/hide custom input
presetSelect.addEventListener("change", () => {
    if (presetSelect.value === "custom") {
        customInput.style.display = "block";
    } else {
        customInput.style.display = "none";
    }
});

// Blast radius calculation
function calculateRadii(yieldKt) {
    const fireballRadius = 67 * Math.cbrt(yieldKt / 0.5); // Fireball radius (m)
    const heavyBlastRadius = 173 * Math.cbrt(yieldKt / 0.5); // Heavy blast (20 psi)
    const moderateBlastRadius = 363 * Math.cbrt(yieldKt / 0.5); // Moderate blast (5 psi)
    const thermalRadius = 399 * Math.cbrt(yieldKt / 0.5); // 3rd-degree burns
    const lightBlastRadius = 930 * Math.cbrt(yieldKt / 0.5); // Light blast (1 psi)

    return { fireballRadius, heavyBlastRadius, moderateBlastRadius, thermalRadius, lightBlastRadius };
}

// Convert meters to pixels
function metersToPixels(meters) {
    const scale = 160 / 60; // 160 studs = 60 pixels
    return meters * scale;
}

// Draw circles
function drawCircles(center, radii) {
    const { fireballRadius, heavyBlastRadius, moderateBlastRadius, thermalRadius, lightBlastRadius } = radii;

    L.circle(center, { radius: metersToPixels(fireballRadius), color: 'red', fillOpacity: 0.5 }).addTo(map);
    L.circle(center, { radius: metersToPixels(heavyBlastRadius), color: 'orange', fillOpacity: 0.4 }).addTo(map);
    L.circle(center, { radius: metersToPixels(moderateBlastRadius), color: 'yellow', fillOpacity: 0.3 }).addTo(map);
    L.circle(center, { radius: metersToPixels(thermalRadius), color: 'purple', fillOpacity: 0.2 }).addTo(map);
    L.circle(center, { radius: metersToPixels(lightBlastRadius), color: 'blue', fillOpacity: 0.1 }).addTo(map);
}

// Detonate button click
detonateButton.addEventListener("click", () => {
    const yieldKt = presetSelect.value === "custom" ? parseFloat(customKtInput.value) : parseFloat(presetSelect.value);
    if (isNaN(yieldKt) || yieldKt <= 0) {
        alert("Please enter a valid yield.");
        return;
    }

    const center = marker.getLatLng();
    const radii = calculateRadii(yieldKt);

    drawCircles(center, radii);

    detailsDiv.innerHTML = `
        <h3>Explosion Details:</h3>
        <p><strong>Fireball Radius:</strong> ${radii.fireballRadius.toFixed(1)} m</p>
        <p><strong>Heavy Blast Radius:</strong> ${radii.heavyBlastRadius.toFixed(1)} m</p>
        <p><strong>Moderate Blast Radius:</strong> ${radii.moderateBlastRadius.toFixed(1)} m</p>
        <p><strong>Thermal Radiation Radius:</strong> ${radii.thermalRadius.toFixed(1)} m</p>
        <p><strong>Light Blast Radius:</strong> ${radii.lightBlastRadius.toFixed(1)} m</p>
    `;
});

// Clear all button
clearAllButton.addEventListener("click", () => {
    map.eachLayer(layer => {
        if (layer instanceof L.Circle) {
            map.removeLayer(layer);
        }
    });
    detailsDiv.innerHTML = "";
});
