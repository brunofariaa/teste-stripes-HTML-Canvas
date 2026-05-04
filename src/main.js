if (!CanvasRenderingContext2D.prototype.drawElementImage) {
    const warning = document.createElement('div');
    warning.style = 'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: #ff4757; color: white; padding: 15px; border-radius: 8px; z-index: 1000; font-family: sans-serif;';
    warning.innerHTML = '⚠️ <strong>Experimental API Required:</strong> Please use Chrome Canary and enable #canvas-draw-element in flags.';
    document.body.appendChild(warning);
}

import { Spring } from './physics.js';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const barElements = document.querySelectorAll('.bar-item');

// Initialize a spring for each bar
const bars = Array.from(barElements).map((el, i) => ({
    el,
    spring: new Spring(100 + (i * 80)), // Default vertical spacing
    baseY: 100 + (i * 80)
}));

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resize);
resize();

// Handle Mouse Influence
window.addEventListener('mousemove', (e) => {
    bars.forEach(bar => {
        const dist = Math.abs(e.clientY - bar.spring.currentY);
        if (dist < 150) {
            // "Elastic" push based on distance
            const push = (150 - dist) * 0.5;
            bar.spring.targetY = bar.baseY + (e.clientY > bar.spring.currentY ? -push : push);
        } else {
            bar.spring.targetY = bar.baseY;
        }
    });
});

// The Experimental Paint Loop
canvas.addEventListener('paint', (event) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // --- DEBUG: Draw a red square ---
    ctx.fillStyle = 'red';
    ctx.fillRect(10, 10, 50, 50); 
    // --------------------------------

    bars.forEach(bar => {
        const currentY = bar.spring.update();

        // Layer 1: The Glow (Bloom)
        ctx.save();
        ctx.filter = 'blur(15px) brightness(1.5)';
        ctx.globalAlpha = 0.4;
        ctx.drawElementImage(bar.el, 100, currentY);
        ctx.restore();

        // Layer 2: The Crisp UI
        ctx.drawElementImage(bar.el, 100, currentY);
    });
});

function loop() {
    // Force a paint event
    if (canvas.requestPaint) {
        canvas.requestPaint();
    } else {
        canvas.dispatchEvent(new Event('paint'));
    }
    requestAnimationFrame(loop);
}

loop();
