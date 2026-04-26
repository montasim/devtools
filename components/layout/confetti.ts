interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    size: number;
    rotation: number;
    rotationSpeed: number;
    opacity: number;
    shape: 'rect' | 'circle';
}

const COLORS = [
    '#7c3aed',
    '#6366f1',
    '#8b5cf6',
    '#a78bfa',
    '#c4b5fd',
    '#f59e0b',
    '#10b981',
    '#ef4444',
    '#3b82f6',
];

export function fireConfetti(duration = 3000) {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d')!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Particle[] = [];
    const startTime = Date.now();

    for (let i = 0; i < 150; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: -20 - Math.random() * 200,
            vx: (Math.random() - 0.5) * 8,
            vy: Math.random() * 3 + 2,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            size: Math.random() * 8 + 4,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 10,
            opacity: 1,
            shape: Math.random() > 0.5 ? 'rect' : 'circle',
        });
    }

    function animate() {
        const elapsed = Date.now() - startTime;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let alive = false;

        for (const p of particles) {
            p.x += p.vx;
            p.vy += 0.1;
            p.y += p.vy;
            p.rotation += p.rotationSpeed;
            p.vx *= 0.99;

            if (elapsed > duration - 1000) {
                p.opacity = Math.max(0, 1 - (elapsed - (duration - 1000)) / 1000);
            }

            if (p.y < canvas.height + 50 && p.opacity > 0) {
                alive = true;
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.globalAlpha = p.opacity;
                ctx.fillStyle = p.color;

                if (p.shape === 'rect') {
                    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
                } else {
                    ctx.beginPath();
                    ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.restore();
            }
        }

        if (alive && elapsed < duration) {
            requestAnimationFrame(animate);
        } else {
            document.body.removeChild(canvas);
        }
    }

    requestAnimationFrame(animate);
}
