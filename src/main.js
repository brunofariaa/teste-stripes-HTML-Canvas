if (!CanvasRenderingContext2D.prototype.drawElementImage) {
    const warning = document.createElement('div');
    warning.style = 'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: #ff4757; color: white; padding: 15px; border-radius: 8px; z-index: 1000; font-family: sans-serif; box-shadow: 0 4px 15px rgba(0,0,0,0.5);';
    warning.innerHTML = '⚠️ <strong>Experimental API Required:</strong> Please use Chrome Canary and enable #canvas-draw-element in flags.';
    document.body.appendChild(warning);
}

import { Spring } from './physics.js';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Select the bars inside the canvas
const barElements = document.querySelectorAll('canvas .bar-item');

// Initialize springs with center-screen targets
const bars = Array.from(barElements).map((el, i) => {
    const spacing = 80;
    const initialY = 200 + (i * spacing);
    return {
        el,
        spring: new Spring(initialY),
        baseY: initialY
    };
});

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resize);
resize();

// Mouse Interaction Logic
window.addEventListener('mousemove', (e) => {
    bars.forEach(bar => {
        const dist = Math.abs(e.clientY - bar.spring.currentY);
        if (dist < 150) {
            const push = (150 - dist) * 0.6;
            bar.spring.targetY = bar.baseY + (e.clientY > bar.spring.currentY ? -push : push);
        } else {
            bar.spring.targetY = bar.baseY;
        }
    });
});

// The Experimental Paint Loop
// This fires when the browser is ready to render the layout subtree
canvas.addEventListener('paint', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = (canvas.width / 2) - 150; // Centers the 300px bars

    bars.forEach(bar => {
        const currentY = bar.spring.update();

        // Layer 1: The Glow (Bloom)
        ctx.save();
        ctx.filter = 'blur(20px) brightness(1.5)';
        ctx.globalAlpha = 0.3;
        ctx.drawElementImage(bar.el, centerX, currentY);
        ctx.restore();

        // Layer 2: The Crisp UI
        ctx.drawElementImage(bar.el, centerX, currentY);
    });
});

function loop() {
    // requestPaint() is the preferred way to trigger the 'paint' event
    if (canvas.requestPaint) {
        canvas.requestPaint();
    } else {
        // Fallback for earlier Canary versions
        canvas.dispatchEvent(new Event('paint'));
    }
    requestAnimationFrame(loop);
}

loop();