import { Spring } from './physics.js';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// --- CONFIGURAÇÃO DA GRELHA ---
const LINE_COUNT = 80;     // Número de linhas (densidade)
const GRID_WIDTH = 0.5;    // 0.5 = 50% da largura do ecrã
const GRID_HEIGHT = 0.5;   // 0.5 = 50% da altura do ecrã
const LINE_COLOR = 'rgba(255, 255, 255, 0.9)';
const LINE_WIDTH = 1.2;
const LINE_POINTS = 30;    // Pontos de curvatura por linha

let lines = [];

function initializeGrid() {
    lines = [];
    
    // 1. Calculamos a largura real que a grelha vai ocupar (ex: 500px num ecrã de 1000px)
    const totalGridWidth = canvas.width * GRID_WIDTH;
    
    // 2. Calculamos a margem esquerda para centrar (ex: (1000 - 500) / 2 = 250px)
    const startX = (canvas.width - totalGridWidth) / 2;
    
    // 3. O espaço entre linhas é calculado apenas sobre a largura da grelha
    const stepX = totalGridWidth / (LINE_COUNT - 1);
    
    for (let i = 0; i < LINE_COUNT; i++) {
        // Cada linha começa no startX e avança um stepX
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
    initializeGrid();
}

window.addEventListener('resize', resize);
resize();

// Lógica de Interação (Mouse)
window.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX;
    const influenceRadius = 150;
    const pushStrength = 60;

    lines.forEach(line => {
        const distToLine = Math.abs(mouseX - line.baseX);

        if (distToLine < influenceRadius) {
            const influence = 1.0 - (distToLine / influenceRadius);
            const displacement = pushStrength * Math.pow(influence, 1.2);
            line.spring.targetValue = (line.baseX < mouseX) ? -displacement : displacement;
        } else {
            line.spring.targetValue = 0;
        }
    });
});

function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = LINE_COLOR;
    ctx.lineWidth = LINE_WIDTH;
    ctx.lineCap = 'round';

    lines.forEach(line => {
        const displacement = line.spring.update();
        ctx.beginPath();
        
        // Centralização Vertical
        const gridTopY = (canvas.height * (1.0 - GRID_HEIGHT)) / 2;
        const gridBottomY = gridTopY + (canvas.height * GRID_HEIGHT);
        const segmentHeight = (gridBottomY - gridTopY) / LINE_POINTS;

        for (let j = 0; j <= LINE_POINTS; j++) {
            const y = gridTopY + (j * segmentHeight);
            const bendFactor = 1.0 - Math.pow(Math.abs(j / LINE_POINTS - 0.5) * 2, 2);
            const x = line.baseX + (displacement * bendFactor);

            if (j === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    });

    requestAnimationFrame(loop);
}

loop();
