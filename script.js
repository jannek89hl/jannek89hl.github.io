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

// Marker setup with increased size
const markerIcon = L.icon({
    iconUrl: 'marker-icon.png', // Use a larger marker icon file here
    iconSize: [41, 63], // Increased marker size
    iconAnchor: [20.5, 63],
});
const marker = L.marker([1100, 1100], { draggable: true, icon: markerIcon }).addTo(map);
marker.bindPopup("Drag me to set the explosion center!").openPopup();

// GUI elements
const presetSelect = document.getElementById("preset");
const customInput = document.getElementById("custom-input");
const customKtInput = document.getElementById("custom-kt");
const detonateButton = document.getElementById("detonate");
const clearAllButton = document.getElementById("clear-all");
const detailsDiv = document.getElementById("details");

// Explosion layers
let explosionLayers = [];
let isExplosionActive = false;

// Show/hide custom input
presetSelect.addEventListener("change", () => {
    customInput.style.display = presetSelect.value === "custom" ? "block" : "none";
});

// Convert meters to pixels
function metersToPixels(meters) {
    const scale = 1.875; // 1.875 pixels per meter
    return meters * scale;
}

// Calculate radii
function calculateRadii(yieldKt) {
    return {
        fireballRadius: 5.58 * Math.cbrt(yieldKt / 0.001),
        heavyBlastRadius: 21.8 * Math.cbrt(yieldKt / 0.001),
        moderateBlastRadius: 45.8 * Math.cbrt(yieldKt / 0.001),
        thermalRadiationRadius: 50.3 * Math.cbrt(yieldKt / 0.001),
        lightBlastRadius: 118 * Math.cbrt(yieldKt / 0.001),
    };
}

// Draw explosion
function drawExplosion(center, radii) {
    clearExplosions();

    explosionLayers.push(L.circle(center, { radius: metersToPixels(radii.fireballRadius), color: 'red', fillOpacity: 0.5 }).addTo(map));
    explosionLayers.push(L.circle(center, { radius: metersToPixels(radii.heavyBlastRadius), color: 'orange', fillOpacity: 0.4 }).addTo(map));
    explosionLayers.push(L.circle(center, { radius: metersToPixels(radii.moderateBlastRadius), color: 'yellow', fillOpacity: 0.3 }).addTo(map));
    explosionLayers.push(L.circle(center, { radius: metersToPixels(radii.thermalRadiationRadius), color: 'purple', fillOpacity: 0.2 }).addTo(map));
    explosionLayers.push(L.circle(center, { radius: metersToPixels(radii.lightBlastRadius), color: 'blue', fillOpacity: 0.1 }).addTo(map));

    isExplosionActive = true;
}

// Clear all explosions
function clearExplosions() {
    explosionLayers.forEach(layer => map.removeLayer(layer));
    explosionLayers = [];
    isExplosionActive = false;
}

// Update marker explosions
marker.on('move', () => {
    if (!isExplosionActive) return;

    const center = marker.getLatLng();
    const yieldKt = presetSelect.value === "custom" ? parseFloat(customKtInput.value) : parseFloat(presetSelect.value);

    if (!isNaN(yieldKt) && yieldKt > 0) {
        const radii = calculateRadii(yieldKt);
        drawExplosion(center, radii);
    }
});

// Detonate button
detonateButton.addEventListener("click", () => {
    const yieldKt = presetSelect.value === "custom" ? parseFloat(customKtInput.value) : parseFloat(presetSelect.value);

    if (isNaN(yieldKt) || yieldKt <= 0) {
        alert("Please enter a valid yield.");
        return;
    }

    const center = marker.getLatLng();
    const radii = calculateRadii(yieldKt);

    drawExplosion(center, radii);

    detailsDiv.innerHTML = `
        <h3>Explosion Details:</h3>
        <p><strong style="color: red;">Fireball Radius:</strong> ${radii.fireballRadius.toFixed(1)} m<br>
        A small but intense fireball that can cause severe burns to anyone within its immediate vicinity.</p>
        <p><strong style="color: orange;">Heavy Blast Radius:</strong> ${radii.heavyBlastRadius.toFixed(1)} m<br>
        Structures within this radius will likely experience total destruction due to the high-pressure blast.</p>
        <p><strong style="color: yellow;">Moderate Blast Radius:</strong> ${radii.moderateBlastRadius.toFixed(1)} m<br>
        Significant damage to buildings and severe injuries to individuals are likely.</p>
        <p><strong style="color: purple;">Thermal Radiation Radius:</strong> ${radii.thermalRadiationRadius.toFixed(1)} m<br>
        Third-degree burns can occur from intense thermal radiation.</p>
        <p><strong style="color: blue;">Light Blast Radius:</strong> ${radii.lightBlastRadius.toFixed(1)} m<br>
        Windows may shatter, and light structural damage is possible.</p>
    `;
});

// Clear button
clearAllButton.addEventListener("click", () => {
    clearExplosions();
    detailsDiv.innerHTML = "";
});
