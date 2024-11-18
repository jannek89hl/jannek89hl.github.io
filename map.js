const map = document.getElementById('map');
const marker = document.getElementById('marker');
const gui = document.getElementById('gui');
const blastRadii = document.getElementById('blast-radii');

let markerX = 1100; // Initial position
let markerY = 1100;

marker.style.left = `${markerX}px`;
marker.style.top = `${markerY}px`;

map.addEventListener('click', (event) => {
    markerX = event.offsetX;
    markerY = event.offsetY;
    marker.style.left = `${markerX}px`;
    marker.style.top = `${markerY}px`;
});

function updateBlastRadii(kilotons) {
    // Logic to calculate and display blast radii based on kilotons
}

document.getElementById('detonate').addEventListener('click', () => {
    const selectedPreset = document.getElementById('preset-select').value;
    const customKilotons = document.getElementById('custom-preset').value;
    const kilotons = customKilotons ? customKilotons : getKilotonsFromPreset(selectedPreset);
    updateBlastRadii(kilotons);
});
