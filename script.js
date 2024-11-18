// Function to detonate the bomb and calculate explosion radii with custom descriptions
function detonate() {
    const yieldValue = parseFloat(document.getElementById('yield').value);
    if (isNaN(yieldValue) || yieldValue <= 0) {
        alert("Please enter a valid Bomb Yield value.");
        return;
    }

    const scalingFactor = 0.533; // 1 pixel = 0.533 meters (scaled to map)

    // Explosion radii in meters
    const fireballRadius = 67 * Math.cbrt(yieldValue) * scalingFactor;
    const heavyBlastRadius = 173 * Math.cbrt(yieldValue) * scalingFactor;
    const moderateBlastRadius = 363 * Math.cbrt(yieldValue) * scalingFactor;
    const thermalRadius = 399 * Math.cbrt(yieldValue) * scalingFactor;
    const lightBlastRadius = 930 * Math.cbrt(yieldValue) * scalingFactor;

    clearExplosionCircles(); // Clear existing circles

    // Add explosion effects and descriptions
    const effects = [
        {
            radius: fireballRadius,
            color: 'red',
            description: `
                <strong>Fireball radius:</strong> ${fireballRadius.toFixed(1)} m (${calculateArea(fireballRadius)} km²).<br>
                Maximum size of the nuclear fireball; anything inside the fireball is effectively vaporized.
            `
        },
        {
            radius: heavyBlastRadius,
            color: 'orange',
            description: `
                <strong>Heavy blast damage radius (20 psi):</strong> ${heavyBlastRadius.toFixed(1)} m (${calculateArea(heavyBlastRadius)} km²).<br>
                Heavily built concrete buildings are severely damaged; fatalities approach 100%.
            `
        },
        {
            radius: moderateBlastRadius,
            color: 'yellow',
            description: `
                <strong>Moderate blast damage radius (5 psi):</strong> ${moderateBlastRadius.toFixed(1)} m (${calculateArea(moderateBlastRadius)} km²).<br>
                Most residential buildings collapse; widespread fatalities and high risk of fires.
            `
        },
        {
            radius: thermalRadius,
            color: 'purple',
            description: `
                <strong>Thermal radiation radius (3rd degree burns):</strong> ${thermalRadius.toFixed(1)} m (${calculateArea(thermalRadius)} km²).<br>
                Causes severe burns, possible amputation, and 100% probability of 3rd-degree burns.
            `
        },
        {
            radius: lightBlastRadius,
            color: 'green',
            description: `
                <strong>Light blast damage radius (1 psi):</strong> ${lightBlastRadius.toFixed(1)} m (${calculateArea(lightBlastRadius)} km²).<br>
                Windows shatter; many injuries caused by flying glass.
            `
        }
    ];

    let descriptions = '';
    effects.forEach(effect => {
        const circle = L.circle(marker.getLatLng(), { radius: effect.radius, color: effect.color, fillOpacity: 0.2 }).addTo(map);
        explosionCircles.push(circle);
        descriptions += `<li><span style="color:${effect.color};">${effect.description}</span></li>`;
    });

    // Update detonation details
    document.getElementById('detonation-details').innerHTML = descriptions;
    document.getElementById('detonation-info').style.display = 'block';
}
