const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');

// Load map image
const mapImage = new Image();
mapImage.src = '10-5-24.png';
mapImage.onload = () => {
    ctx.drawImage(mapImage, 0, 0, canvas.width, canvas.height);
};

// Marker variables
let markerX = canvas.width / 2;
let markerY = canvas.height / 2;
const markerRadius = 10;

// Draw marker
function drawMarker() {
    ctx.beginPath();
    ctx.arc(markerX, markerY, markerRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'red';
    ctx.fill();
    ctx.stroke();
}

// Event listener for dragging the marker
let isDragging = false;
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if marker is clicked
    if (
        Math.hypot(x - markerX, y - markerY) <= markerRadius
    ) {
        isDragging = true;
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (isDragging) {
        const rect = canvas.getBoundingClientRect();
        markerX = e.clientX - rect.left;
        markerY = e.clientY - rect.top;
        updateCanvas();
    }
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
});

function updateCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(mapImage, 0, 0, canvas.width, canvas.height);
    drawMarker();
}

// Initial draw
updateCanvas();
