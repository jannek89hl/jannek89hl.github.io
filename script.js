const presetSelect = document.getElementById('preset');
const customInput = document.getElementById('customInput');
const customInputContainer = document.getElementById('customInputContainer');
const detonateButton = document.getElementById('detonateButton');
const description = document.getElementById('description');
const zoomInput = document.getElementById('zoom');

// Show/hide custom input
presetSelect.addEventListener('change', () => {
    customInputContainer.style.display =
        presetSelect.value === 'custom' ? 'block' : 'none';
});

// Convert kilotons to radii
function calculateRadii(kt) {
    return {
        fireball: 18.5 * Math.sqrt(kt / 0.02),
        heavyBlast: 59.1 * Math.sqrt(kt / 0.02),
        moderateBlast: 124 * Math.sqrt(kt / 0.02),
        thermalRadiation: 136 * Math.sqrt(kt / 0.02),
        lightBlast: 319 * Math.sqrt(kt / 0.02),
        noHarmThermal: 329 * Math.sqrt(kt / 0.02),
    };
}

// Detonate button functionality
detonateButton.addEventListener('click', () => {
    const kt =
        presetSelect.value === 'custom'
            ? parseFloat(customInput.value)
            : presetSelect.value === 'grenade'
            ? 0.02
            : presetSelect.value === 'c4'
            ? 0.1
            : 0.5;

    const radii = calculateRadii(kt);

    // Draw explosion
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(mapImage, 0, 0, canvas.width, canvas.height);
    drawExplosion(radii);
    drawMarker();
    updateDescription(kt, radii);
});

// Draw explosion circles
function drawExplosion(radii) {
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.4;

    Object.values(radii).forEach((radius, index) => {
        ctx.beginPath();
        ctx.arc(markerX, markerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `hsl(${index * 60}, 100%, 50%)`;
        ctx.stroke();
    });

    ctx.globalAlpha = 1;
}

// Update description
function updateDescription(kt, radii) {
    description.innerHTML = `
        <strong>${kt} kt Explosion:</strong><br>
        Fireball Radius: ${radii.fireball.toFixed(1)} m<br>
        Heavy Blast Radius: ${radii.heavyBlast.toFixed(1)} m<br>
        Moderate Blast Radius: ${radii.moderateBlast.toFixed(1)} m<br>
        Thermal Radiation Radius (3rd Degree): ${radii.thermalRadiation.toFixed(1)} m<br>
        Light Blast Radius: ${radii.lightBlast.toFixed(1)} m<br>
        Thermal Radiation Radius (No Harm): ${radii.noHarmThermal.toFixed(1)} m<br>
    `;
}

// Zoom functionality
zoomInput.addEventListener('input', () => {
    const zoomLevel = parseFloat(zoomInput.value);
    canvas.style.transform = `scale(${zoomLevel})`;
    canvas.style.transformOrigin = 'top left';
});
