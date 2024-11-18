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

// Get explosion descriptions based on yield
function getExplosionDescriptions(yieldKt) {
    if (yieldKt <= 0.001) {
        return {
            fireball: "A small but intense fireball capable of causing severe burns within close range.",
            heavyBlast: "Localized damage, including shattered glass and potential ruptured eardrums.",
            moderateBlast: "Moderate damage, including broken windows and injuries from flying debris.",
            thermalRadiation: "Potential for severe burns within this radius.",
            lightBlast: "Minor injuries and light damage from shockwaves over a wider area.",
        };
    } else if (yieldKt <= 0.5) {
        return {
            fireball: "A powerful fireball capable of incinerating anything at its center.",
            heavyBlast: "Severe concussive force, causing significant injuries and destruction to nearby buildings.",
            moderateBlast: "Extensive damage to structures, with high risk of injuries from debris.",
            thermalRadiation: "Serious burns to anyone within this large area of intense heat.",
            lightBlast: "Minor damage to structures and widespread debris over a large area.",
        };
    } else {
        return {
            fireball: "An immense fireball that incinerates everything at its core.",
            heavyBlast: "Massive concussive force, obliterating structures and causing severe injuries.",
            moderateBlast: "Widespread damage to buildings and risk of injuries from falling debris.",
            thermalRadiation: "Severe burns to anyone exposed within a large radius.",
            lightBlast: "Damage to buildings and injuries caused by widespread debris and shockwaves.",
        };
    }
}

// Draw explosion circles on the map
function drawCircles(center, radii) {
    const { fireballRadius, heavyBlastRadius, moderateBlastRadius, thermalRadiationRadius, lightBlastRadius } = radii;

    L.circle(center, { radius: metersToPixels(fireballRadius), color: 'red', fillOpacity: 0.5 }).addTo(map);
    L.circle(center, { radius: metersToPixels(heavyBlastRadius), color: 'orange', fillOpacity: 0.4 }).addTo(map);
    L.circle(center, { radius: metersToPixels(moderateBlastRadius), color: 'yellow', fillOpacity: 0.3 }).addTo(map);
    L.circle(center, { radius: metersToPixels(thermalRadiationRadius), color: 'purple', fillOpacity: 0.2 }).addTo(map);
    L.circle(center, { radius: metersToPixels(lightBlastRadius), color: 'blue', fillOpacity: 0.1 }).addTo(map);
}

// Detonate button click handler
detonateButton.addEventListener("click", () => {
    const yieldKt = presetSelect.value === "custom" ? parseFloat(customKtInput.value) : parseFloat(presetSelect.value);
    if (isNaN(yieldKt) || yieldKt <= 0) {
        alert("Please enter a valid yield.");
        return;
    }

    const center = marker.getLatLng();
    const radii = calculateRadii(yieldKt);
    const descriptions = getExplosionDescriptions(yieldKt);

    drawCircles(center, radii);

    detailsDiv.innerHTML = `
        <h3>Explosion Details:</h3>
        <p><strong>Fireball Radius:</strong> ${radii.fireballRadius.toFixed(1)} m</p>
        <p>${descriptions.fireball}</p>
        <p><strong>Heavy Blast Radius:</strong> ${radii.heavyBlastRadius.toFixed(1)} m</p>
        <p>${descriptions.heavyBlast}</p>
        <p><strong>Moderate Blast Radius:</strong> ${radii.moderateBlastRadius.toFixed(1)} m</p>
        <p>${descriptions.moderateBlast}</p>
        <p><strong>Thermal Radiation Radius:</strong> ${radii.thermalRadiationRadius.toFixed(1)} m</p>
        <p>${descriptions.thermalRadiation}</p>
        <p><strong>Light Blast Radius:</strong> ${radii.lightBlastRadius.toFixed(1)} m</p>
        <p>${descriptions.lightBlast}</p>
    `;
});

// Clear all button click handler
clearAllButton.addEventListener("click", () => {
    map.eachLayer(layer => {
        if (layer instanceof L.Circle) {
            map.removeLayer(layer);
        }
    });
    detailsDiv.innerHTML = "";
});
