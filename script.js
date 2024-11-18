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

// GUI elements
const presetSelect = document.getElementById("preset");
const customInput = document.getElementById("custom-input");
const customKtInput = document.getElementById("custom-kt");
const detonateButton = document.getElementById("detonate");
const clearAllButton = document.getElementById("clear-all");
const detailsDiv = document.getElementById("details");

// Show/hide custom input
presetSelect.addEventListener("change", () => {
    customInput.style.display = presetSelect.value === "custom" ? "block" : "none";
});

// Explosion descriptions based on radii
function getExplosionDescriptions(yieldKt) {
    if (yieldKt <= 0.001) {
        return {
            fireball: "A compact but intense fireball causing severe burns to anyone within close range.",
            heavyBlast: "Strong concussive force, enough to shatter glass and rupture eardrums nearby.",
            moderateBlast: "Moderate damage to structures, injuries from debris, and broken windows.",
            thermalRadiation: "Severe burns to exposed skin within this radius.",
            lightBlast: "Light structural damage and flying debris over a wide area.",
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

// Blast radius calculation
function calculateRadii(yieldKt) {
    const baseRadii = {
        fireballRadius: 5.58 * Math.cbrt(yieldKt / 0.001), // Fireball radius (m)
        heavyBlastRadius: 21.8 * Math.cbrt(yieldKt / 0.001), // Heavy blast (20 psi)
        moderateBlastRadius: 45.8 * Math.cbrt(yieldKt / 0.001), // Moderate blast (5 psi)
        thermalRadiationRadius: 50.3 * Math.cbrt(yieldKt / 0.001), // Thermal radiation (3rd-degree burns)
        lightBlastRadius: 118 * Math.cbrt(yieldKt / 0.001), // Light blast (1 psi)
    };

    return baseRadii;
}

// Convert meters to pixels
function metersToPixels(meters) {
    const scale = 60 / (160 * 0.2); // Pixels per meter
    return meters * scale;
}

// Draw circles and descriptions
let drawnLayers = [];
function drawCircles(center, radii, descriptions) {
    const {
        fireballRadius,
        heavyBlastRadius,
        moderateBlastRadius,
        thermalRadiationRadius,
        lightBlastRadius,
    } = radii;

    const circles = [
        { radius: fireballRadius, color: 'red', label: descriptions.fireball },
        { radius: heavyBlastRadius, color: 'orange', label: descriptions.heavyBlast },
        { radius: moderateBlastRadius, color: 'yellow', label: descriptions.moderateBlast },
        { radius: thermalRadiationRadius, color: 'purple', label: descriptions.thermalRadiation },
        { radius: lightBlastRadius, color: 'blue', label: descriptions.lightBlast },
    ];

    // Clear previous circles
    clearCircles();

    // Add circles
    circles.forEach(({ radius, color, label }) => {
        const circle = L.circle(center, {
            radius: metersToPixels(radius),
            color: color,
            fillOpacity: 0.4,
        }).addTo(map);
        drawnLayers.push(circle);

        // Add description popup
        circle.bindPopup(`<strong>${label}</strong><br>Radius: ${radius.toFixed(1)} m`);
    });
}

// Clear previous circles
function clearCircles() {
    drawnLayers.forEach(layer => map.removeLayer(layer));
    drawnLayers = [];
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
    const descriptions = getExplosionDescriptions(yieldKt);

    drawCircles(center, radii, descriptions);

    detailsDiv.innerHTML = `
        <h3>Explosion Details:</h3>
        <p><strong>Fireball Radius:</strong> ${radii.fireballRadius.toFixed(1)} m</p>
        <p><strong>Heavy Blast Radius:</strong> ${radii.heavyBlastRadius.toFixed(1)} m</p>
        <p><strong>Moderate Blast Radius:</strong> ${radii.moderateBlastRadius.toFixed(1)} m</p>
        <p><strong>Thermal Radiation Radius:</strong> ${radii.thermalRadiationRadius.toFixed(1)} m</p>
        <p><strong>Light Blast Radius:</strong> ${radii.lightBlastRadius.toFixed(1)} m</p>
    `;
});

// Clear all button
clearAllButton.addEventListener("click", () => {
    clearCircles();
    detailsDiv.innerHTML = "";
});

// Update circles on marker move
marker.on("move", () => {
    if (drawnLayers.length > 0) {
        const yieldKt = presetSelect.value === "custom" ? parseFloat(customKtInput.value) : parseFloat(presetSelect.value);
        if (!isNaN(yieldKt) && yieldKt > 0) {
            const center = marker.getLatLng();
            const radii = calculateRadii(yieldKt);
            const descriptions = getExplosionDescriptions(yieldKt);
            drawCircles(center, radii, descriptions);
        }
    }
});
