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

// Function to generate descriptions based on the radius
function getExplosionDescription(radius) {
    if (radius <= 10) {
        return "A small fireball, intense but localized. It can cause severe burns to anyone within its immediate vicinity. If the detonation touches the ground, radioactive fallout will significantly increase, and all within the fireball radius will be vaporized.";
    } else if (radius <= 30) {
        return "A moderate fireball capable of causing serious burns and some blast injuries. The heat and pressure are extreme within this radius. If the detonation touches the ground, fallout will increase, and structures within this area could be severely damaged or destroyed.";
    } else if (radius <= 50) {
        return "A large fireball with the potential to cause severe burns over a wide area. The heat and concussive force could lead to life-threatening injuries. Fallout would be significant if it touches the ground, and it would vaporize everything within the fireball.";
    } else if (radius <= 100) {
        return "An immense fireball with catastrophic potential, capable of causing severe burns and blast injuries over a large area. It could obliterate structures and generate intense fallout if it touches the ground. All within this range would likely be vaporized.";
    } else if (radius <= 200) {
        return "A massive explosion, devastating everything within its reach. Severe burns, blast damage, and structural destruction would occur. Fallout is a major concern if it touches the ground, affecting areas far beyond the initial blast.";
    } else {
        return "The ultimate devastation, causing widespread destruction. Buildings, people, and infrastructure within this range are completely obliterated, with significant fallout and radiation contamination spreading over vast distances.";
    }
}

// Additional detailed descriptions for other blast radii
function getHeavyBlastDescription(radius) {
    if (radius <= 10) {
        return "At 20 psi overpressure, there is minimal damage, but fatalities can occur from blast injuries if close to the detonation point.";
    } else if (radius <= 30) {
        return "At 20 psi overpressure, heavily built concrete buildings are severely damaged or demolished; fatalities approach 100%. This is often used as a benchmark for heavy damage in cities.";
    } else if (radius <= 50) {
        return "At 20 psi overpressure, this area will see major structural damage, fatalities are widespread, and most buildings will collapse or suffer catastrophic damage.";
    } else if (radius <= 100) {
        return "At 20 psi overpressure, this zone will experience total destruction of buildings, and few survivors will remain. The blast is intense enough to demolish heavily built structures.";
    } else {
        return "The heavy blast zone at this range ensures total destruction. Concrete, steel, and other materials are obliterated. Few, if any, structures survive.";
    }
}

function getModerateBlastDescription(radius) {
    if (radius <= 10) {
        return "At 5 psi overpressure, light structural damage is expected, with injuries being non-fatal but widespread.";
    } else if (radius <= 30) {
        return "At 5 psi overpressure, most residential buildings collapse, injuries are universal, and fatalities are widespread. The chance of fire starting due to damage is high, and buildings are at risk of spreading fire.";
    } else if (radius <= 50) {
        return "At 5 psi overpressure, nearly all buildings in this area collapse or suffer heavy damage. Fires start in many structures, and there is a high chance of injury or death due to debris and collapse.";
    } else if (radius <= 100) {
        return "At 5 psi overpressure, nearly all buildings collapse, fires spread rapidly, and injuries are almost universal. Recovery in this zone is virtually impossible.";
    } else {
        return "Massive structural damage at 5 psi, with widespread fatalities. Fires are nearly guaranteed, and the area is completely uninhabitable.";
    }
}

function getThermalRadiationDescription(radius) {
    if (radius <= 10) {
        return "Within this radius, severe third-degree burns are a certainty for anyone exposed. These burns destroy all layers of skin, causing permanent scarring or requiring amputation.";
    } else if (radius <= 30) {
        return "In this zone, third-degree burns extend throughout the layers of skin, causing permanent damage and often leading to amputations. Survivors face a long road to recovery.";
    } else if (radius <= 50) {
        return "Third-degree burns are widespread in this radius, and most exposed individuals will suffer irreversible damage to skin, muscle, and tissue. Immediate medical care is essential for survival.";
    } else if (radius <= 100) {
        return "In this thermal radiation zone, third-degree burns are almost guaranteed for anyone within sight of the explosion. The damage to the skin and underlying tissues will be catastrophic, and many will not survive without immediate medical intervention.";
    } else {
        return "Anyone within this zone will suffer third-degree burns. Survival chances are minimal, and those who do survive will face life-altering consequences due to the severity of the injuries.";
    }
}

function getLightBlastDescription(radius) {
    if (radius <= 10) {
        return "At around 1 psi overpressure, glass windows may break. People inside buildings may experience injuries from flying glass shards.";
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
<span class="fireball-description">${getExplosionDescription(radii.fireballRadius)}</span></p>

<p><strong class="heavy-blast-radius">Heavy Blast Radius:</strong> ${radii.heavyBlastRadius.toFixed(1)} m<br>
<span class="heavy-blast-description">${getExplosionDescription(radii.heavyBlastRadius)}</span></p>

<p><strong class="moderate-blast-radius">Moderate Blast Radius:</strong> ${radii.moderateBlastRadius.toFixed(1)} m<br>
<span class="moderate-blast-description">${getExplosionDescription(radii.moderateBlastRadius)}</span></p>

<p><strong class="thermal-radiation-radius">Thermal Radiation Radius:</strong> ${radii.thermalRadiationRadius.toFixed(1)} m<br>
<span class="thermal-radiation-description">${getExplosionDescription(radii.thermalRadiationRadius)}</span></p>

<p><strong class="light-blast-radius">Light Blast Radius:</strong> ${radii.lightBlastRadius.toFixed(1)} m<br>
<span class="light-blast-description">${getExplosionDescription(radii.lightBlastRadius)}</span></p>
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
