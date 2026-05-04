export class Spring {
    constructor(y = 0) {
        this.currentY = y;
        this.targetY = y;
        this.velocity = 0;
        this.stiffness = 0.1;
        this.damping = 0.85;
    }

    update() {
        const force = -this.stiffness * (this.currentY - this.targetY);
        this.velocity = (this.velocity + force) * this.damping;
        this.currentY += this.velocity;
        return this.currentY;
    }
}