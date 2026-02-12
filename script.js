const canvas = document.getElementById("universe");
const ctx = canvas.getContext("2d");
const bgMusic = document.getElementById("bgMusic");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let stars = [];
let shootingStars = [];
let particles = [];
let images = [];
let angle = 0;

// ============================
// CONFIGURATION
// ============================
const totalImages = 31; // Change this number if you add/remove images
const imageSize = 80; // size of clickable image stars

// ============================
// DYNAMIC IMAGE ELEMENTS
// ============================
for (let i = 1; i <= totalImages; i++) {
    const img = new Image();
    img.src = `Image${i}.jpeg`; // make sure your images are named correctly
    img.style.position = "absolute";
    img.style.width = `${imageSize}px`;
    img.style.height = `${imageSize}px`;
    img.style.pointerEvents = "auto"; // allows clicking
    document.body.appendChild(img);

    images.push({
        element: img,
        angle: Math.random() * Math.PI * 2,
        radius: 250 + Math.random() * 150,
        speed: 0.0005 + Math.random() * 0.001
    });
}

// ============================
// STAR CLASS (Twinkling + Glow)
// ============================
class Star {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.baseRadius = Math.random() * 2 + 0.5; // minimum radius
        this.radius = this.baseRadius;
        this.twinkleSpeed = Math.random() * 0.005 + 0.002;
    }

    update() {
        this.radius = Math.max(
            0.3,
            this.baseRadius + Math.sin(Date.now() * this.twinkleSpeed) * 0.8
        );
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = "white";
        ctx.shadowBlur = 15;
        ctx.shadowColor = "white";
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

// ============================
// SHOOTING STAR
// ============================
class ShootingStar {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = 0;
        this.len = 300;
        this.speed = 10;
        this.size = 2;
        this.life = 0;
    }

    update() {
        this.x += this.speed;
        this.y += this.speed;
        this.life++;

        if (this.life > 40) {
            this.burst();
            return false;
        }
        return true;
    }

    draw() {
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - this.len, this.y - this.len);
        ctx.strokeStyle = "white";
        ctx.lineWidth = this.size;
        ctx.shadowBlur = 20;
        ctx.shadowColor = "white";
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    burst() {
        for (let i = 0; i < 20; i++) {
            particles.push(new Particle(this.x, this.y));
        }
    }
}

// ============================
// BURST PARTICLES
// ============================
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = Math.random() * 3 + 0.5;
        this.speedX = (Math.random() - 0.5) * 6;
        this.speedY = (Math.random() - 0.5) * 6;
        this.life = 50;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life--;
        return this.life > 0;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = "white";
        ctx.globalAlpha = this.life / 50;
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

// ============================
// CREATE STARS
// ============================
for (let i = 0; i < 200; i++) {
    stars.push(new Star());
}

// ============================
// ANIMATION LOOP
// ============================
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw stars
    stars.forEach(star => {
        star.update();
        star.draw();
    });

    // Constellation Lines
    for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
            let dx = stars[i].x - stars[j].x;
            let dy = stars[i].y - stars[j].y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 120) {
                ctx.beginPath();
                ctx.strokeStyle = "rgba(255,255,255,0.08)";
                ctx.moveTo(stars[i].x, stars[i].y);
                ctx.lineTo(stars[j].x, stars[j].y);
                ctx.stroke();
            }
        }
    }

    // Shooting stars
    if (Math.random() < 0.005) {
        shootingStars.push(new ShootingStar());
    }

    shootingStars = shootingStars.filter(star => {
        star.draw();
        return star.update();
    });

    // Burst particles
    particles = particles.filter(p => {
        p.draw();
        return p.update();
    });

    // Orbiting image stars
    angle += 0.001;

    images.forEach(img => {
        img.angle += img.speed;
        const x = canvas.width / 2 + Math.cos(img.angle) * img.radius;
        const y = canvas.height / 2 + Math.sin(img.angle) * img.radius;

        img.element.style.left = `${x - imageSize / 2}px`;
        img.element.style.top = `${y - imageSize / 2}px`;
    });

    requestAnimationFrame(animate);
}

animate();

// ============================
// MUSIC FADE-IN
// ============================
document.body.addEventListener("click", () => {
    if (bgMusic.paused) {
        bgMusic.volume = 0;
        bgMusic.play();

        let fade = setInterval(() => {
            if (bgMusic.volume < 0.5) {
                bgMusic.volume += 0.01;
            } else {
                clearInterval(fade);
            }
        }, 100);
    }
});

// ============================
// RESIZE HANDLING
// ============================
window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
