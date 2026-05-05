export class Spring {
    constructor() {
        this.currentValue = 0;
        this.targetValue = 0;
        this.velocity = 0;
        // Standard spring constants for elasticity
        this.stiffness = 0.08;
        this.damping = 0.85;
    }

    update() {
        const force = -this.stiffness * (this.currentValue - this.targetValue);
        this.velocity = (this.velocity + force) * this.damping;
        this.currentValue += this.velocity;
        return this.currentValue;
    }
}