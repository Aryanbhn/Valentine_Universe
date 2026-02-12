// ---------------------------
// CANVAS SETUP
// ---------------------------
const canvas = document.getElementById('universe');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ---------------------------
// LOAD STAR IMAGES SAFELY
// ---------------------------
const totalStars = 30;
const starImages = [];
const stars = [];

for (let i = 1; i <= totalStars; i++) {
    const img = new Image();
    img.src = `Image${i}.jpeg`;
    img.onerror = () => console.warn(`Image${i}.jpeg failed to load`);
    starImages.push(img);
}

// ---------------------------
// BACKGROUND FAINT STARS
// ---------------------------
const backgroundStars = [];
for (let i = 0; i < 300; i++) {
    backgroundStars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        color: ["#555", "#777", "#999"][Math.floor(Math.random() * 3)]
    });
}

// ---------------------------
// CLICKABLE STARS
// ---------------------------
const positions = [];

function isFarEnough(x, y){
    for(const pos of positions){
        const dx = pos.x - x;
        const dy = pos.y - y;
        if(Math.sqrt(dx*dx + dy*dy) < 70) return false;
    }
    return true;
}

starImages.forEach((img, i) => {
    if (!img.complete) return; // skip if not loaded yet
    let x, y;
    let attempts = 0;
    do {
        x = Math.random() * (canvas.width - 200) + 100;
        y = Math.random() * (canvas.height - 200) + 100;
        attempts++;
        if(attempts > 100) break; // prevent infinite loop
    } while(!isFarEnough(x, y));
    positions.push({x, y});
    const size = Math.random() * 4 + 6;
    stars.push({x, y, size, image: img});
});

// ---------------------------
// SHOOTING STARS
// ---------------------------
const shootingStars = [];
for(let i=0;i<5;i++){
    shootingStars.push({
        x: Math.random()*canvas.width,
        y: Math.random()*300,
        length: Math.random()*70 + 50,
        speed: Math.random()*5 + 5
    });
}

// ---------------------------
// POPUP
// ---------------------------
const popup = document.getElementById('popup');
const popupImage = document.getElementById('popupImage');
const closePopup = document.getElementById('closePopup');

function showPopup(imgObj){
    popupImage.src = imgObj.src;
    popup.classList.remove('hidden');
}

closePopup.onclick = () => { popup.classList.add('hidden'); };

// ---------------------------
// ANIMATION LOOP
// ---------------------------
function animate(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // black background
    ctx.fillStyle = "#000000";
    ctx.fillRect(0,0,canvas.width, canvas.height);

    // draw faint stars
    backgroundStars.forEach(s=>{
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size,0,Math.PI*2);
        ctx.fill();
    });

    // draw clickable stars
    stars.forEach(star=>{
        if(!star.image.complete || star.image.naturalWidth === 0) return; // skip broken images

        // glow
        const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size+3);
        gradient.addColorStop(0,'white');
        gradient.addColorStop(0.5,'#8888ff22');
        gradient.addColorStop(1,'rgba(0,0,0,0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(star.x,star.y,star.size+3,0,Math.PI*2);
        ctx.fill();

        // main star
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size,0,Math.PI*2);
        ctx.fill();
    });

    // shooting stars
    shootingStars.forEach(s=>{
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x + s.length, s.y + s.length/2);
        ctx.stroke();

        s.x += s.speed;
        s.y += s.speed/2;
        if(s.x > canvas.width || s.y > canvas.height){
            s.x = -100;
            s.y = Math.random()*300;
        }
    });

    requestAnimationFrame(animate);
}

animate();

// ---------------------------
// STAR CLICK DETECTION
// ---------------------------
canvas.addEventListener('click', function(e){
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    for(const star of stars){
        const dx = star.x - mouseX;
        const dy = star.y - mouseY;
        if(Math.sqrt(dx*dx + dy*dy) <= star.size){
            showPopup(star.image);
            break;
        }
    }
});
