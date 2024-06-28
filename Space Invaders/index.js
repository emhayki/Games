const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScore = document.getElementById('finalScore');
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let gameStarted = false;
let game = { over: false, active: false };
let score = 0;

class Player {
    constructor() {
        this.rotation = 0;
        this.velocity = { x: 0, y: 0 };
        this.opacity = 1;
        this.image = new Image();
        this.image.src = './img/spaceship.png';
        this.image.onload = () => {
            const scale = 0.07;
            this.width = this.image.width * scale;
            this.height = this.image.height * scale;
            this.position = {
                x: canvas.width / 2 - this.width / 2,
                y: canvas.height - 100
            };
            this.draw(); 
        };
    }

    draw() {
        if (this.image.complete) {
            c.save();
            c.globalAlpha = this.opacity;
            c.translate(this.position.x + this.width / 2, this.position.y + this.height / 2);
            c.rotate(this.rotation);
            c.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
            c.restore();
        }
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

class Projectile {
    constructor({ position, velocity }) {
        this.position = position;
        this.velocity = velocity;
        this.radius = 5;
    }

    draw() {
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        c.fillStyle = 'red';
        c.fill();
        c.closePath();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

class InvaderProjectile {
    constructor({ position, velocity }) {
        this.position = position;
        this.velocity = velocity;
        this.width = 3;
        this.height = 10;
    }

    draw() {
        c.fillStyle = '#FFFF00';
        c.fillRect(this.position.x, this.position.y, this.width, this.height);
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

class Invader {
    constructor({ position }) {
        this.position = { ...position };
        this.velocity = { x: 0, y: 0 };
        this.image = new Image();
        this.image.src = './img/invader.png';
        this.image.onload = () => {
            const scale = 0.04;
            this.width = this.image.width * scale;
            this.height = this.image.height * scale;
            this.draw(); 
        };
    }

    draw() {
        if (this.image.complete) {
            c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
        }
    }

    update({ velocity }) {
        this.position.x += velocity.x;
        this.position.y += velocity.y;
        this.draw();
    }

    shoot(invaderProjectiles) {
        invaderProjectiles.push(new InvaderProjectile({
            position: { x: this.position.x + this.width / 2, y: this.position.y + this.height},
            velocity: { x: 0, y: 5 }
        }));
    }
}

class Grid {
    constructor() {
        this.position = { x: 0, y: 0 };
        this.velocity = { x: 3, y: 0 };
        this.invaders = [];
        const columns = Math.floor(Math.random() * 10 + 2);
        const rows = Math.floor(Math.random() * 5 + 2);
        this.width = columns * 50;

        for (let i = 0; i < columns; i++) {
            for (let j = 0; j < rows; j++) {
                this.invaders.push(new Invader({ position: { x: i * 50, y: j * 50 + 60 } }));
            }
        }
    }

    update() {
        this.position.x += this.velocity.x;
        if (this.position.x + this.width >= canvas.width || this.position.x < 0) {
            this.velocity.x = -this.velocity.x;
            this.velocity.y = 30;
        } else {
            this.velocity.y = 0;
        }

        this.invaders.forEach(invader => {
            invader.update({ velocity: this.velocity });
        });
    }
}

class Particle{
    constructor({ position, velocity, radius, color, fades }) {
        this.position = position;
        this.velocity = velocity;
        this.radius = radius;
        this.color = color;
        this.opacity = 1;
        this.fades = fades;
    }

    draw() {
        c.save();
        c.globalAlpha = this.opacity;
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        c.fillStyle = this.color;
        c.fill();
        c.closePath();
        c.restore();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        if (this.fades) {
            this.opacity -= 0.01;            
        }
    }
}


// ===============================
const player = new Player();
const keys = {
    left: { pressed: false },
    right: { pressed: false },
    up: { pressed: false },
    down: { pressed: false }
};

let particles = [];
let invaderProjectiles = [];
let projectiles = [];
let grids = [new Grid()];
let frames = 0;
let randomInterval = Math.floor((Math.random() * 500) + 500);

function toggleStartScreen() {
    if (gameStarted) {
        startScreen.style.display = 'none';
    } else {
        startScreen.style.display = 'flex';
    }
}

function showGameOver() {
    finalScore.textContent = score;      
    gameOverScreen.style.display = 'flex'; 
}

function startGame() {
    gameStarted = true;
    game.active = true;
    toggleStartScreen();
    animate();
}

for (let i = 0; i < 100; i++) {
    particles.push(new Particle({
        position: {
            x: Math.random() * canvas.width, 
            y: Math.random() * canvas.height 
        }, 
        velocity: {
            x: 0, 
            y: 0.3
        }, 
        radius: Math.random() * 2,
        color: 'white',
        fades: false
    }))   
}

function createParticles({Object, color}){
    for (let i = 0; i < 15; i++) {
        particles.push(new Particle({
            position: {
                x: Object.position.x + Object.width/2, 
                y: Object.position.y + Object.height/2
            }, 
            velocity: {
                x: (Math.random() - 0.5) * 2, 
                y: (Math.random() - 0.5) * 2
            }, 
            radius: Math.random() * 3,
            color: color || '#58eb34',
            fades: true
        }))   
    }
}

function animate() {
    if (!game.active) return;
    requestAnimationFrame(animate);
    c.fillStyle = 'black';
    c.fillRect(0, 0, canvas.width, canvas.height);

    player.update();
    handlePlayerMovement();

    particles.forEach((particle, i) => {
        if (particle.position.y - particle.radius >= canvas.height) {
            particle.position.x = Math.random() * canvas.width;
            particle.position.y = -particle.radius;
        }

        if (particle.opacity <= 0) {
            setTimeout(() => {
                particles.splice(i, 1)
            }, 0)
        } else {
            particle.update();
        }
    })

    invaderProjectiles.forEach((projectile, index) => {
        projectile.update();

        // Check if any invader projectile hits the player
        if (projectile.position.y + projectile.height >= player.position.y &&
            projectile.position.y <= player.position.y + player.height &&
            projectile.position.x + projectile.width >= player.position.x &&
            projectile.position.x <= player.position.x + player.width) {
            setTimeout(() => {invaderProjectiles.splice(index, 1);
                player.opacity = 0;
                game.over = true;
                showGameOver();
            }, 0)

            setTimeout(() => {game.active = false}, 750);
            createParticles({Object: player, color: 'white'});
        }

        // Remove projectiles that go off screen or add condition to remove after hitting the player
        if (projectile.position.y > canvas.height) {
            invaderProjectiles.splice(index, 1);
        }
    });

    let projectilesToRemove = new Set();
    projectiles.forEach((projectile, index) => {
        projectile.update();
        if (projectile.position.y + projectile.radius <= 0) {
            projectilesToRemove.add(index);
        }
    });

    let invaderProjectilesToRemove = new Set();
    invaderProjectiles.forEach((invaderProjectile, index) => {
        invaderProjectile.update();
        if (invaderProjectile.position.y > canvas.height) {
            invaderProjectilesToRemove.add(index);
        }
    });

    grids.forEach((grid, gridIndex) => {
        grid.update();

        if (frames % 50 === 0 && grid.invaders.length > 0) {
            const randomInvaderIndex = Math.floor(Math.random() * grid.invaders.length);
            grid.invaders[randomInvaderIndex].shoot(invaderProjectiles);
        }

        let remainingInvaders = [];
        grid.invaders.forEach((invader, invaderIndex) => {
            let invaderHit = false;
            projectiles.forEach((projectile, projectileIndex) => {
                if (!projectilesToRemove.has(projectileIndex) && projectile.position.y - projectile.radius <= invader.position.y + invader.height &&
                    projectile.position.y + projectile.radius >= invader.position.y &&
                    projectile.position.x + projectile.radius >= invader.position.x &&
                    projectile.position.x - projectile.radius <= invader.position.x + invader.width) {
                    invaderHit = true;
                    score += 100;
                    scoreEl.innerHTML = score;
                    createParticles({Object: invader});
                    projectilesToRemove.add(projectileIndex);
                }
            });
            if (!invaderHit) {
                remainingInvaders.push(invader);
            }
        });

        if (remainingInvaders.length > 0) {
            const minX = Math.min(...remainingInvaders.map(inv => inv.position.x));
            const maxX = Math.max(...remainingInvaders.map(inv => inv.position.x + inv.width));
            grid.position.x = minX;
            grid.width = maxX - minX;
        } else {
            grids.splice(gridIndex, 1);
        }

        grid.invaders = remainingInvaders;
    });

    projectiles = projectiles.filter((_, index) => !projectilesToRemove.has(index));
    invaderProjectiles = invaderProjectiles.filter((_, index) => !invaderProjectilesToRemove.has(index));

    if (frames % randomInterval === 0 && grids.length === 0) {
        grids.push(new Grid());
        randomInterval = Math.floor((Math.random() * 500) + 500);
        frames = 0;
    }

    frames++;
}



function handlePlayerMovement() {
    if (keys.left.pressed && !keys.right.pressed && player.position.x > 0) {
        player.velocity.x = -20;
        player.rotation = -0.18;
    } else if (keys.right.pressed && !keys.left.pressed && player.position.x < canvas.width - player.width) {
        player.velocity.x = 20;
        player.rotation = 0.18;
    } else {
        player.velocity.x = 0;
        player.rotation = 0;
    }

    if (keys.up.pressed && !keys.down.pressed && player.position.y > 0) {
        player.velocity.y = -8;
    } else if (keys.down.pressed && !keys.up.pressed && player.position.y < canvas.height - player.height) {
        player.velocity.y = 8;
    } else {
        player.velocity.y = 0;
    }
}

addEventListener('keydown', ({ key }) => {
    if (!gameStarted && key === ' ') {
        startGame();
    }

    if (game.over) return;

    switch (key) {
        case 'ArrowLeft':
            keys.left.pressed = true;
            break;
        case 'ArrowRight':
            keys.right.pressed = true;
            break;
        case 'ArrowUp':
            keys.up.pressed = true;
            break;
        case 'ArrowDown':
            keys.down.pressed = true;
            break;
        case ' ':
            if (!game.over && game.active) {
                projectiles.push(new Projectile({
                    position: { x: player.position.x + player.width / 2, y: player.position.y },
                    velocity: { x: 0, y: -10 }
                }));
            }
            break;
    }
});

addEventListener('keyup', ({ key }) => {
    switch (key) {
        case 'ArrowLeft':
            keys.left.pressed = false;
            break;
        case 'ArrowRight':
            keys.right.pressed = false;
            break;
        case 'ArrowUp':
            keys.up.pressed = false;
            break;
        case 'ArrowDown':
            keys.down.pressed = false;
            break;
    }
});

window.onload = () => {
    toggleStartScreen(); 
};
