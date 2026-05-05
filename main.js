import { Spring } from './physics.js';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Grid Configuration
const LINE_COUNT = 100; // Match the density of Image 2
const LINE_COLOR = 'rgba(255, 255, 255, 0.9)'; // Bright white
const LINE_WIDTH = 1.0; // Thin lines from Image 2
const GRID_HEIGHT = 0.5; // Lines cover 85% of screen height
const GRID_WIDTH = 0.5;
const LINE_POINTS = 30; // Number of vertices per line for smooth bending

// Setup the line grid with a spring for each line
let lines = [];

function initializeGrid() {
    lines = [];
    
    // 1. Calcula a largura real que a grelha vai ocupar
    const totalGridWidth = canvas.width * GRID_WIDTH;
    
    // 2. Calcula onde deve começar (margem esquerda) para ficar centrada
    const startX = (canvas.width - totalGridWidth) / 2;
    
    // 3. O espaço entre linhas (stepX) agora é baseado na largura da grelha, não do ecrã
    const stepX = totalGridWidth / (LINE_COUNT - 1);
    
    for (let i = 0; i < LINE_COUNT; i++) {
        // A posição base agora soma o startX
        const baseX = startX + (i * stepX);
        lines.push({
            baseX,
            spring: new Spring()
        });
    }
}

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initializeGrid(); // Re-calculate grid spacing on resize
}

window.addEventListener('resize', resize);
resize(); // Initial setup

// Mouse Interaction Logic (calculate target influence)
window.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX;
    const influenceRadius = 180;
    const pushStrength = 70; // How far lines are pushed horizontally

    lines.forEach(line => {
        // Find distance from mouse to the entire line (x-axis distance)
        const distToLine = Math.abs(mouseX - line.baseX);

        if (distToLine < influenceRadius) {
            // Apply push influence based on distance
            const influence = 1.0 - (distToLine / influenceRadius);

            // Calculate a horizontal displacement vector
            const push = influence * pushStrength;

            // Directional pushing (optional, for Image 2 it feels purely radial, so let's use a simpler radial 'gap' effect)
            const displacement = pushStrength * Math.pow(influence, 1.2);

            // Push lines outwards from the mouse position
            line.spring.targetValue = (line.baseX < mouseX) ? -displacement : displacement;
        } else {
            // No influence, return to original position
            line.spring.targetValue = 0;
        }
    });
});

// The standard requestAnimationFrame loop (NOT the experimental paint loop)
function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Aesthetic: Draw a subtle glow background for premium feel
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radialGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, canvas.width);
    radialGlow.addColorStop(0, 'rgba(30, 30, 30, 0.2)');
    radialGlow.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
    ctx.fillStyle = radialGlow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the Lines
    ctx.strokeStyle = LINE_COLOR;
    ctx.lineWidth = LINE_WIDTH;
    ctx.lineCap = 'round'; // Smooth ends

    lines.forEach(line => {
        // Update physics
        const displacement = line.spring.update();

        // Start drawing the line geometry
        ctx.beginPath();

        // Define line boundaries vertically
        const gridTopY = (canvas.height * (1.0 - GRID_HEIGHT)) / 2;
        const gridBottomY = gridTopY + (canvas.height * GRID_HEIGHT);
        const segmentHeight = (gridBottomY - gridTopY) / LINE_POINTS;

        // Iteratively calculate points along the vertical line and draw segments
        for (let j = 0; j <= LINE_POINTS; j++) {
            const y = gridTopY + (j * segmentHeight);

            // To create bending, displacement must be strongest at the center
            // of the vertical grid, tapering off to zero at the ends.
            // (Creates an arc shape, not just straight movement)
            const bendFactor = 1.0 - Math.pow(Math.abs(j / LINE_POINTS - 0.5) * 2, 2.5);

            // Calculate final (bent) position
            const x = line.baseX + (displacement * bendFactor);

            if (j === 0) {
                // Move to the top of the line
                ctx.moveTo(x, y);
            } else {
                // Draw to the next vertex
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
    });

    requestAnimationFrame(loop);
}

loop();
