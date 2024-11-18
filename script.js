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

// Explosion layers for updating
let explosionLayers = [];

// Show/hide custom input
presetSelect.addEventListener("change", () => {
    if (presetSelect.value === "custom") {
        customInput.style.display = "block";
    } else {
        customInput.style.display = "none";
    }
});

// Convert meters to pixels
function metersToPixels(meters) {
    const scale = 1.875; // 1.875 pixels per meter
    return meters * scale;
}

// Calculate explosion radii based on yield (in kilotons)
function calculateRadii(yieldKt) {
    return {
        fireballRadius: 5.58 * Math.cbrt(yieldKt / 0.001),
        heavyBlastRadius: 21.8 * Math.cbrt(yieldKt / 0.001),
        moderateBlastRadius: 45.8 * Math.cbrt(yieldKt / 0.001),
        thermalRadiationRadius: 50.3 * Math.cbrt(yieldKt / 0.001),
        lightBlastRadius: 118 * Math.cbrt(yieldKt / 0.001),
    };
}

// Get explosion descriptions with colors
function getExplosionDescriptions(yieldKt) {
    return `
        <p><strong style="color: red;">Fireball Radius:</strong> A small but intense fireball capable of causing severe burns.</p>
        <p><strong style="color: orange;">Heavy Blast Radius:</strong> Severe localized damage, including structural destruction.</p>
        <p><strong style="color: yellow;">Moderate Blast Radius:</strong> Moderate damage to structures, with debris injuries likely.</p>
        <p><strong style="color: purple;">Thermal Radiation Radius:</strong> Severe burns within this area of intense heat.</p>
        <p><strong style="color: blue;">Light Blast Radius:</strong> Light structural damage and debris injuries over a wide area.</p>
    `;
}

// Draw explosion circles on the map
function drawCircles(center, radii) {
    clearExplosions();
    const { fireballRadius, heavyBlastRadius, moderateBlastRadius, thermalRadiationRadius, lightBlastRadius } = radii;

    explosionLayers.push(L.circle(center, { radius: metersToPixels(fireballRadius), color: 'red', fillOpacity: 0.5 }).addTo(map));
    explosionLayers.push(L.circle(center, { radius: metersToPixels(heavyBlastRadius), color: 'orange', fillOpacity: 0.4 }).addTo(map));
    explosionLayers.push(L.circle(center, { radius: metersToPixels(moderateBlastRadius), color: 'yellow', fillOpacity: 0.3 }).addTo(map));
    explosionLayers.push(L.circle(center, { radius: metersToPixels(thermalRadiationRadius), color: 'purple', fillOpacity: 0.2 }).addTo(map));
    explosionLayers.push(L.circle(center, { radius: metersToPixels(lightBlastRadius), color: 'blue', fillOpacity: 0.1 }).addTo(map));
}

// Clear previous explosions
function clearExplosions() {
    explosionLayers.forEach(layer => map.removeLayer(layer));
    explosionLayers = [];
}

// Update explosion on marker drag
marker.on('move', () => {
    const center = marker.getLatLng();
    const yieldKt = presetSelect.value === "custom" ? parseFloat(customKtInput.value) : parseFloat(presetSelect.value);

    if (!isNaN(yieldKt) && yieldKt > 0) {
        const radii = calculateRadii(yieldKt);
        drawCircles(center, radii);
    }
});

// Detonate button click handler
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
        ${getExplosionDescriptions(yieldKt)}
    `;
});

// Clear all button click handler
clearAllButton.addEventListener("click", () => {
    clearExplosions();
    detailsDiv.innerHTML = "";
});
