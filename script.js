// ============================
// CANVAS SETUP
// ============================
const canvas = document.getElementById("universe");
const ctx = canvas.getContext("2d");
const bgMusic = document.getElementById("bgMusic");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.position = "absolute";
canvas.style.top = "0";
canvas.style.left = "0";
canvas.style.zIndex = "1";

let stars = [];
let normalStars = []; // stars for constellations
let shootingStars = [];
let particles = [];
let imageStars = []; // stars with images

// ============================
// CONFIGURATION
// ============================
const totalImages = 38;     // Number of images
const starCount = 200;      // Number of normal stars
const clickRadius = 15;     // How close the click must be to trigger popup

// ============================
// LOAD IMAGES
// ============================
let images = [];
for (let i = 1; i <= totalImages; i++) {
    const img = new Image();
    img.src = `Image${i}.jpeg`;
    images.push(img);
}

// ============================
// STAR CLASS
// ============================
class Star {
    constructor(x, y, image = null) {
        this.x = x || Math.random() * canvas.width;
        this.y = y || Math.random() * canvas.height;
        this.baseRadius = Math.random() * 2 + 0.5;
        this.radius = this.baseRadius;
        this.twinkleSpeed = Math.random() * 0.005 + 0.002;
        this.image = image; // optional associated image
    }

    update() {
        this.radius = Math.max(
            0.3,
            this.baseRadius + Math.sin(Date.now() * this.twinkleSpeed) * 0.8
        );
    }

    draw() {
        ctx.beginPath();
        // Make image stars slightly bigger and yellow
        ctx.arc(this.x, this.y, this.radius + (this.image ? 1.5 : 0), 0, Math.PI * 2);
        ctx.fillStyle = this.image ? "yellow" : "white";
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.image ? "yellow" : "white";
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
// PARTICLES
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
// CREATE STARS AND IMAGE STARS
// ============================
// ============================
// CREATE STARS WITHOUT CLUMPING
// ============================

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const safeRadius = 200; // no stars within 200px of title
const minDistance = 70; // minimum distance between stars

function randomStarPosition(existingStars) {
    let x, y;
    let attempts = 0;
    do {
        x = Math.random() * canvas.width;
        y = Math.random() * canvas.height;
        attempts++;
        // check distance from title
        const dxCenter = x - centerX;
        const dyCenter = y - centerY;
        const distFromCenter = Math.sqrt(dxCenter * dxCenter + dyCenter * dyCenter);
        if (distFromCenter < safeRadius) continue;

        // check distance from other stars
        let tooClose = false;
        for (let s of existingStars) {
            const dx = x - s.x;
            const dy = y - s.y;
            if (Math.sqrt(dx*dx + dy*dy) < minDistance) {
                tooClose = true;
                break;
            }
        }
        if (!tooClose) break;

    } while (attempts < 1000);
    return { x, y };
}

// Normal stars
for (let i = 0; i < starCount; i++) {
    const pos = randomStarPosition(stars);
    const star = new Star(pos.x, pos.y);
    stars.push(star);
    normalStars.push(star); // <-- THIS LINE FIXES CONSTELLATIONS
}


// Image stars
for (let i = 0; i < images.length; i++) {
    const pos = randomStarPosition(stars);
    const star = new Star(pos.x, pos.y, images[i]);
    stars.push(star);
    imageStars.push(star);
}



// ============================
// ANIMATION LOOP
// ============================
function animate() {
    // Background gradient
    const grad = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, canvas.height / 10,
        canvas.width / 2, canvas.height / 2, canvas.height
    );
    grad.addColorStop(0, "#0a0a2a");
    grad.addColorStop(1, "#000000");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw stars
    stars.forEach(star => {
        star.update();
        star.draw();
    });

    // Draw constellations between normal stars
    for (let i = 0; i < normalStars.length; i++) {
        for (let j = i + 1; j < normalStars.length; j++) {
            const dx = normalStars[i].x - normalStars[j].x;
            const dy = normalStars[i].y - normalStars[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 120) {
                ctx.beginPath();
                ctx.strokeStyle = "rgba(255,255,255,0.08)";
                ctx.moveTo(normalStars[i].x, normalStars[i].y);
                ctx.lineTo(normalStars[j].x, normalStars[j].y);
                ctx.stroke();
            }
        }
    }

    // Shooting stars
    if (Math.random() < 0.005) shootingStars.push(new ShootingStar());
    shootingStars = shootingStars.filter(star => {
        star.draw();
        return star.update();
    });

    // Burst particles
    particles = particles.filter(p => {
        p.draw();
        return p.update();
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
        const fade = setInterval(() => {
            if (bgMusic.volume < 0.5) bgMusic.volume += 0.01;
            else clearInterval(fade);
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

// ============================
// POPUP HANDLING
// ============================
const popup = document.getElementById("popup");
const popupImage = document.getElementById("popupImage");
const closePopup = document.getElementById("closePopup");

canvas.addEventListener("click", e => {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    for (let star of imageStars) {
        const dx = clickX - star.x;
        const dy = clickY - star.y;
        if (Math.sqrt(dx * dx + dy * dy) < clickRadius) {
            popupImage.src = star.image.src;
            popup.classList.remove("hidden");
            break;
        }
    }
});

closePopup.addEventListener("click", () => {
    popup.classList.add("hidden");
});
