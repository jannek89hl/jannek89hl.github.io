// Initialize the map
const map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -4,
    maxZoom: 5,
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
marker.bindPopup("Drag me to set the explosion center!", { offset: [0, -64] }).openPopup();

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

// Function to generate descriptions based on the radius for each category

// Fireball Radius: Describes the maximum size of the nuclear fireball
function getFireballDescription(radius) {
    if (radius <= 10) {
        return "A small fireball, intense but localized. Anything inside the fireball is vaporized.";
    } else if (radius <= 30) {
        return "A moderate fireball capable of vaporizing everything within its radius. If it touches the ground, significant fallout will occur.";
    } else if (radius <= 50) {
        return "A large fireball, capable of vaporizing anything within its range. Fallout from a ground detonation would be catastrophic.";
    } else if (radius <= 100) {
        return "An immense fireball with catastrophic potential. It would vaporize everything within this zone and cause massive fallout if detonated near the ground.";
    } else {
        return "A massive explosion, devastating everything within its reach. All in this range will be vaporized, and fallout would spread extensively.";
    }
}

// Heavy Blast Radius: Describes the effects of a blast at 20 psi overpressure
function getHeavyBlastDescription(radius) {
    if (radius <= 10) {
        return "At 20 psi overpressure, the blast will cause significant damage to buildings and fatalities are highly probable.";
    } else if (radius <= 30) {
        return "At 20 psi, concrete buildings will be severely damaged or demolished; fatalities are nearly 100%. This zone represents heavy damage in urban areas.";
    } else if (radius <= 50) {
        return "At 20 psi overpressure, most buildings in this radius will collapse. There will be major casualties and the area will be completely obliterated.";
    } else if (radius <= 100) {
        return "A blast of 20 psi will cause total destruction to everything within this radius, with heavy structural damage and almost no survivors.";
    } else {
        return "This area is within the maximum heavy blast zone. Structures are completely demolished, and the area is uninhabitable.";
    }
}

// Moderate Blast Radius: Describes the effects of a blast at 5 psi overpressure
function getModerateBlastDescription(radius) {
    if (radius <= 10) {
        return "At 5 psi overpressure, there will be light damage to buildings, and injuries will be widespread but non-lethal.";
    } else if (radius <= 30) {
        return "At 5 psi overpressure, most residential buildings will collapse. Widespread injuries and fatalities are common, with fire hazards high.";
    } else if (radius <= 50) {
        return "At 5 psi overpressure, nearly all buildings in this area will collapse or suffer significant damage. Fires will spread, and casualties are inevitable.";
    } else if (radius <= 100) {
        return "Buildings in this radius will be heavily damaged, and nearly all people in this zone will suffer injuries or fatalities. Fires and structural damage will be widespread.";
    } else {
        return "Complete destruction and high fatalities. Fires will spread rapidly, and there is no chance of survival for most within this radius.";
    }
}

// Thermal Radiation Radius: Describes the effects of thermal radiation (third-degree burns)
function getThermalRadiationDescription(radius) {
    if (radius <= 10) {
        return "Within this radius, third-degree burns are a certainty. These burns destroy all layers of skin, often requiring amputation.";
    } else if (radius <= 30) {
        return "Third-degree burns will extend throughout the layers of skin, causing permanent damage and often leading to amputations.";
    } else if (radius <= 50) {
        return "Third-degree burns are widespread, and most exposed individuals will suffer irreversible skin, muscle, and tissue damage.";
    } else if (radius <= 100) {
        return "Thermal radiation at this distance will cause severe third-degree burns across the body, and survival without immediate medical intervention is unlikely.";
    } else {
        return "Anyone within this zone will suffer third-degree burns. The damage to the skin and underlying tissues will be catastrophic, and few will survive.";
    }
}

// Light Blast Radius: Describes the effects of the blast at around 1 psi overpressure (shattering windows)
function getLightBlastDescription(radius) {
    if (radius <= 10) {
        return "At 1 psi overpressure, glass windows may break. People inside buildings may experience injuries from flying glass shards.";
    } else if (radius <= 30) {
        return "At 1 psi overpressure, windows will shatter, causing injuries from flying glass. Casualties will rise sharply due to the risk of cuts and trauma from shattered glass.";
    } else if (radius <= 50) {
        return "In this radius, glass windows will be broken by the blast, causing numerous injuries. People in the area will be exposed to the danger of flying glass, and the risk of trauma is significant.";
    } else if (radius <= 100) {
        return "The light blast radius will see widespread window damage and numerous injuries. Many people will be hurt by flying glass and debris, often with broken limbs or cuts from sharp glass.";
    } else {
        return "A wide area will be affected by shattered glass. People who venture out into the open will be at great risk of injury from the debris.";
    }
}

// The main function to determine the description based on radius
function getExplosionDescription(radius, type) {
    if (type === 'fireball') {
        return getFireballDescription(radius);
    } else if (type === 'heavyBlast') {
        return getHeavyBlastDescription(radius);
    } else if (type === 'moderateBlast') {
        return getModerateBlastDescription(radius);
    } else if (type === 'thermalRadiation') {
        return getThermalRadiationDescription(radius);
    } else if (type === 'lightBlast') {
        return getLightBlastDescription(radius);
    } else {
        return "Unknown radius type.";
    }
}

// Draw explosion
function drawExplosion(center, radii) {
    clearExplosions();

    explosionLayers.push(L.circle(center, { radius: metersToPixels(radii.fireballRadius), color: 'red', fillOpacity: 0.5 }).addTo(map));
    explosionLayers.push(L.circle(center, { radius: metersToPixels(radii.heavyBlastRadius), color: 'orange', fillOpacity: 0.4 }).addTo(map));
    explosionLayers.push(L.circle(center, { radius: metersToPixels(radii.moderateBlastRadius), color: '#FFD700', fillOpacity: 0.3 }).addTo(map));
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
<p><strong class="fireball-radius">Fireball Radius:</strong> ${radii.fireballRadius.toFixed(1)} m<br>
<span class="fireball-description">${getExplosionDescription(radii.fireballRadius, 'fireball')}</span></p>

<p><strong class="heavy-blast-radius">Heavy Blast Radius:</strong> ${radii.heavyBlastRadius.toFixed(1)} m<br>
<span class="heavy-blast-description">${getExplosionDescription(radii.heavyBlastRadius, 'heavyBlast')}</span></p>

<p><strong class="moderate-blast-radius">Moderate Blast Radius:</strong> ${radii.moderateBlastRadius.toFixed(1)} m<br>
<span class="moderate-blast-description">${getExplosionDescription(radii.moderateBlastRadius, 'moderateBlast')}</span></p>

<p><strong class="thermal-radiation-radius">Thermal Radiation Radius:</strong> ${radii.thermalRadiationRadius.toFixed(1)} m<br>
<span class="thermal-radiation-description">${getExplosionDescription(radii.thermalRadiationRadius, 'thermalRadiation')}</span></p>

<p><strong class="light-blast-radius">Light Blast Radius:</strong> ${radii.lightBlastRadius.toFixed(1)} m<br>
<span class="light-blast-description">${getExplosionDescription(radii.lightBlastRadius, 'lightBlast')}</span></p>
`;
});

// Clear button
clearAllButton.addEventListener("click", () => {
    clearExplosions();
    detailsDiv.innerHTML = "";
});

// Add light/dark mode toggle at the very end
const toggleButton = document.getElementById("toggle-theme");
let isDarkMode = false;

toggleButton.addEventListener("click", () => {
    isDarkMode = !isDarkMode;

    if (isDarkMode) {
        document.body.classList.add("dark-mode");
        toggleButton.textContent = "Switch to Light Mode";
    } else {
        document.body.classList.remove("dark-mode");
        toggleButton.textContent = "Switch to Dark Mode";
    }
});
