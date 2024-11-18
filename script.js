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

// Explosion descriptions
const explosionDescriptions = {
    fireball: "A small but intense fireball that can cause severe burns to anyone within its immediate vicinity.",
    heavyBlast: "Severe concussive force, potentially causing injuries like ruptured eardrums, internal damage, and knockdowns.",
    moderateBlast: "Light structural damage, broken windows, and injuries from flying debris, including concussions or minor injuries.",
    lightBlast: "Light damage to structures and potential for non-lethal injuries like minor cuts from debris, glass shattering.",
};

// Blast radius calculation
function calculateRadii(yieldKt) {
    const fireballRadius = 2 * Math.cbrt(yieldKt / 0.02); // Fireball radius (m)
    const heavyBlastRadius = 6 * Math.cbrt(yieldKt / 0.02); // Heavy blast (20 psi)
    const moderateBlastRadius = 10 * Math.cbrt(yieldKt / 0.02); // Moderate blast (5 psi)
    const lightBlastRadius = 25 * Math.cbrt(yieldKt / 0.02); // Light blast (1 psi)

    return { fireballRadius, heavyBlastRadius, moderateBlastRadius, lightBlastRadius };
}

// Convert meters to pixels
function metersToPixels(meters) {
    const scale = 60 / (160 * 0.2); // Pixels per meter
    return meters * scale;
}

// Draw circles and descriptions
let drawnLayers = [];
function drawCircles(center, radii) {
    const { fireballRadius, heavyBlastRadius, moderateBlastRadius, lightBlastRadius } = radii;

    const circles = [
        { radius: fireballRadius, color: 'red', label: explosionDescriptions.fireball },
        { radius: heavyBlastRadius, color: 'orange', label: explosionDescriptions.heavyBlast },
        { radius: moderateBlastRadius, color: 'yellow', label: explosionDescriptions.moderateBlast },
        { radius: lightBlastRadius, color: 'blue', label: explosionDescriptions.lightBlast },
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

    drawCircles(center, radii);

    detailsDiv.innerHTML = `
        <h3>Explosion Details:</h3>
        <p><strong>Fireball Radius:</strong> ${radii.fireballRadius.toFixed(1)} m</p>
        <p><strong>Heavy Blast Radius:</strong> ${radii.heavyBlastRadius.toFixed(1)} m</p>
        <p><strong>Moderate Blast Radius:</strong> ${radii.moderateBlastRadius.toFixed(1)} m</p>
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
            drawCircles(center, radii);
        }
    }
});
