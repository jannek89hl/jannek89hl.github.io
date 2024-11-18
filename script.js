// Initialize the Leaflet map
const map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -2,
    maxZoom: 2,
});

// Map dimensions and image overlay
const bounds = [[0, 0], [2200, 2200]];
const image = L.imageOverlay('10-5-24.png', bounds).addTo(map);
map.fitBounds(bounds);

// Add a draggable marker for the explosion point
const marker = L.marker([1100, 1100], { draggable: true }).addTo(map);
marker.bindPopup("Explosion Point").openPopup();

// Store existing explosion circles
let explosionCircles = [];

// Function to clear previous explosions
function clearExplosionCircles() {
    explosionCircles.forEach(circle => map.removeLayer(circle));
    explosionCircles = [];
    document.getElementById('detonation-details').innerHTML = ''; // Clear descriptions
    document.getElementById('detonation-info').style.display = 'none'; // Hide info box
}

// Function to calculate area from radius
function calculateArea(radius) {
    return (Math.PI * radius * radius / 1e6).toFixed(2); // Area in km²
}

// Function to detonate the bomb and calculate explosion radii
function detonate() {
    const yieldValue = parseFloat(document.getElementById('yield').value);
    if (isNaN(yieldValue) || yieldValue <= 0) {
        alert("Please enter a valid Bomb Yield value.");
        return;
    }

    const scalingFactor = 0.533; // 1 pixel = 0.533 meters (scaled to map)

    // Explosion radii in meters (example formula, scalable)
    const fireballRadius = 67 * Math.cbrt(yieldValue) * scalingFactor; // Fireball radius
    const heavyBlastRadius = 173 * Math.cbrt(yieldValue) * scalingFactor; // 20 psi
    const moderateBlastRadius = 363 * Math.cbrt(yieldValue) * scalingFactor; // 5 psi
    const thermalRadius = 399 * Math.cbrt(yieldValue) * scalingFactor; // 3rd degree burns
    const lightBlastRadius = 930 * Math.cbrt(yieldValue) * scalingFactor; // 1 psi

    // Clear existing circles
    clearExplosionCircles();

    // Add circles for each effect
    const effects = [
        { radius: fireballRadius, color: 'red', description: `Fireball radius: ${fireballRadius.toFixed(1)} m (${calculateArea(fireballRadius)} km²)` },
        { radius: heavyBlastRadius, color: 'orange', description: `Heavy blast damage radius (20 psi): ${heavyBlastRadius.toFixed(1)} m (${calculateArea(heavyBlastRadius)} km²)` },
        { radius: moderateBlastRadius, color: 'yellow', description: `Moderate blast damage radius (5 psi): ${moderateBlastRadius.toFixed(1)} m (${calculateArea(moderateBlastRadius)} km²)` },
        { radius: thermalRadius, color: 'purple', description: `Thermal radiation radius (3rd degree burns): ${thermalRadius.toFixed(1)} m (${calculateArea(thermalRadius)} km²)` },
        { radius: lightBlastRadius, color: 'green', description: `Light blast damage radius (1 psi): ${lightBlastRadius.toFixed(1)} m (${calculateArea(lightBlastRadius)} km²)` },
    ];

    let descriptions = '';
    effects.forEach(effect => {
        const circle = L.circle(marker.getLatLng(), { radius: effect.radius, color: effect.color, fillOpacity: 0.2 }).addTo(map);
        explosionCircles.push(circle);
        descriptions += `<li><span style="color:${effect.color};"><strong>${effect.description}</strong></span></li>`;
    });

    // Update detonation details
    document.getElementById('detonation-details').innerHTML = descriptions;
    document.getElementById('detonation-info').style.display = 'block';
}

// Update circles when marker is moved
marker.on('move', () => {
    if (explosionCircles.length > 0) {
        explosionCircles.forEach(circle => circle.setLatLng(marker.getLatLng()));
    }
});

// Event listener for preset selection
document.getElementById('preset').addEventListener('change', function () {
    const preset = this.value;

    if (preset === 'hand_grenade') {
        document.getElementById('yield').value = 0.001;
    } else if (preset === 'c4') {
        document.getElementById('yield').value = 0.05;
    } else if (preset === 'dynamite') {
        document.getElementById('yield').value = 0.1;
    }
});

// Event listener for detonate button
document.getElementById('detonate').addEventListener('click', detonate);

// Event listener for clear button
document.getElementById('clear-effects').addEventListener('click', clearExplosionCircles);
