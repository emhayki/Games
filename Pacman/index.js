const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
console.log(c);
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const scoreEl = document.querySelector('scoreEl');

canvas.width = 1000;
canvas.height = 600;

class Boundary {
    static width = 40;
    static height = 40;
    constructor({ position, image }) {
        this.position = position;
        this.width = Boundary.width;
        this.height = Boundary.height;
        this.image = image;
    }

    draw() {
        c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
    }
}


class Player {
    constructor({ position, velocity }) {
        this.position = position;
        this.velocity = velocity;
        this.radius = 15;
        this.radians = 0.75;
        this.openRate = 0.12;
        this.rotation = 0;
    }

    draw() {
        c.save();
        c.translate(this.position.x, this.position.y);
        c.rotate(this.rotation);
        c.translate(-this.position.x, -this.position.y);
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius, 0.75 - this.radians, Math.PI * 2 - (0.75 - this.radians), false);
        c.lineTo(this.position.x, this.position.y);
        c.fillStyle = 'yellow';
        c.fill();
        c.closePath();
        c.restore();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        if (this.radians < 0 || this.radians > 0.75) {
            this.openRate = -this.openRate;
        }
        this.radians += this.openRate;

        if (this.velocity.x > 0) this.rotation = 0; 
        else if (this.velocity.x < 0) this.rotation = Math.PI; 
        else if (this.velocity.y < 0) this.rotation = 1.5 * Math.PI;
        else if (this.velocity.y > 0) this.rotation = 0.5 * Math.PI;
    }
}

class Ghost {
    constructor({ position, image, speed = 2 }) {
        this.position = position;
        this.velocity = { x: speed, y: 0 };
        this.radius = 15;
        this.image = image;
        this.speed = speed;
    }

    draw() {
        if (this.image) {
            c.drawImage(this.image, this.position.x - this.radius, this.position.y - this.radius, this.radius * 2, this.radius * 2);
        } else {
            c.beginPath();
            c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
            c.fillStyle = 'red'; 
            c.fill();
            c.closePath();
        }
    }

    update(playerPosition) {
        this.draw();

        this.chasePlayer(playerPosition);

        const distance = Math.hypot(playerPosition.x - this.position.x, playerPosition.y - this.position.y);
        if (distance < this.radius + player.radius) {
            gameOver = true; 
        }

        if (!gameOver) {
            this.position.x += this.velocity.x;
            this.position.y += this.velocity.y;
        } else {
            this.velocity.x = 0;
            this.velocity.y = 0;
        }
    }

    chasePlayer(playerPosition) {
        const xDiff = playerPosition.x - this.position.x;
        const yDiff = playerPosition.y - this.position.y;

        const preferX = Math.abs(xDiff) > Math.abs(yDiff);

        if (preferX) {
            this.velocity.x = this.speed * Math.sign(xDiff);
            this.velocity.y = 0;
        } else {
            this.velocity.y = this.speed * Math.sign(yDiff);
            this.velocity.x = 0;
        }

        let nextPosition = {
            x: this.position.x + this.velocity.x,
            y: this.position.y + this.velocity.y
        };

        if (!this.checkCollisions(nextPosition)) {
            return false;
        }

        if (preferX) {
            this.velocity.y = this.speed * Math.sign(yDiff);
            this.velocity.x = 0;
        } else {
            this.velocity.x = this.speed * Math.sign(xDiff);
            this.velocity.y = 0;
        }

        nextPosition = {
            x: this.position.x + this.velocity.x,
            y: this.position.y + this.velocity.y
        };

        if (!this.checkCollisions(nextPosition)) {
            return false;
        }

        this.velocity.x = 0;
        this.velocity.y = 0;
        return true;
    }

    checkCollisions(nextPosition) {
        return boundaries.some(boundary => circleCollidesWithRectangle({
            circle: { ...this, position: nextPosition },
            rectangle: boundary
        }));
    }
}





class Pellet {
    constructor({position}){
        this.position = position
        this.radius = 3
    }

    draw() {
        c.beginPath()
        c.arc(this.position.x,this.position.y,this.radius,0,Math.PI*2)
        c.fillStyle = 'white';
        c.fill();
        c.closePath()
    }

}

const keys = {
    up: {
        pressed: false
    },
    down: {
        pressed: false
    },
    left: {
        pressed: false
    },
    right: {
        pressed: false
    }
}
let score = 0;
let lastKey = ''

const map = [
    ['1', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '2'],
    ['|', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.','.', '|'],
    ['|', '.', 'b', '.', '[', '2', '.', '.', '[', '-', ']', '.', '.', 'b', '.', '1', '-', ']', '.', '.', '.', '[', '2','.', '|'],
    ['|', '.', '.', '.', '.', '|', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|', '.', '.', '.', '.', '.', '.', '|','.', '|'],
    ['|', '.', '[', ']', '.', '_', '.', '[', ']', '.', 'b', '.', '[', ']', '.', '4', '-', ']', '.', '[', '-', '-', '3','.', '|'],
    ['|', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.','.', '|'],
    ['|', '.', 'b', '.', '[', ']', '.', 'b', '.', '[', ']', '.', 'b', '.', '[', ']', '.', 'b', '.', '[', ']', '.', '^','.', '|'],
    ['|', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|','.', '|'],
    ['|', '.', '[', ']', '.', '^', '.', '[', ']', '.', 'b', '.', '[', ']', '.', '.', '^', '.', '.', '.', '^', '.', '_','.', '|'],
    ['|', '.', '.', '.', '.', '|', '.', '.', '.', '.', '.', '.', '.', '.', '.', '[', '+', ']', '.', '.', '|', '.', '.','.', '|'],
    ['|', '.', 'b', '.', '[', '5', ']', '.', 'b', '.', '[', '-', ']', '.', '.', '.', '_', '.', '.', '[', '5', ']', '.','.', '|'],
    ['|', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.','.', '|'],
    ['|', '.', 'b', '.', 'b', '.', '[', '-', '-', ']', '.', '[', '-', ']', '.', '[', '-', ']', '.', '[', ']', '.', 'b','.', '|'],
    ['|', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.','.', '|'],
    ['4', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '3'],
];



function createImage(src){
    const image = new Image()
    image.src = src
    return image
}

const ghostImage1 = createImage('./img/gg1.png'); 
const ghostImage2 = createImage('./img/gg2.png');
const ghostImage3 = createImage('./img/gg3.png');
const ghostImage4 = createImage('./img/gg4.png');

function getRandomSpeed(min, max, usedSpeeds) {
    let potentialSpeed;
    do {
        potentialSpeed = Math.floor(Math.random() * (max - min + 1) + min);
    } while (usedSpeeds.has(potentialSpeed));
    usedSpeeds.add(potentialSpeed);
    return potentialSpeed;
}

const usedSpeeds = new Set();  

const ghosts = [
    new Ghost({
        position: {x: 9 * Boundary.width + Boundary.width / 2, y: Boundary.height + Boundary.height / 2},
        image: ghostImage1,
        speed: getRandomSpeed(1, 4, usedSpeeds)
    }),
    new Ghost({
        position: {x: 9 * Boundary.width + Boundary.width / 2, y: 5 * Boundary.height + Boundary.height / 2},
        image: ghostImage2,
        speed: getRandomSpeed(1, 4, usedSpeeds)
    }),
    new Ghost({
        position: {x: 9 * Boundary.width + Boundary.width / 2, y: 7 * Boundary.height + Boundary.height / 2},
        image: ghostImage3,
        speed: getRandomSpeed(1, 4, usedSpeeds)
    }),
    new Ghost({
        position: {x: 9 * Boundary.width + Boundary.width / 2, y: 9 * Boundary.height + Boundary.height / 2},
        image: ghostImage4,
        speed: getRandomSpeed(1, 4, usedSpeeds)
    })
];



const pellets = [];
const boundaries = [];
const player = new Player({position: {x: Boundary.width + Boundary.width/2, y: Boundary.height + Boundary.height /2}, velocity: {x:0, y: 0}})

map.forEach((row, rowIndex) => {
    row.forEach((symbol, columnIndex) => {
        if (symbol === '-') {
            boundaries.push(new Boundary({ position: {x: columnIndex * Boundary.width, y: rowIndex * Boundary.height}, image: createImage('./img/pipeHorizontal.png')}));
        } else if (symbol === '|') {
            boundaries.push(new Boundary({ position: {x: columnIndex * Boundary.width, y: rowIndex * Boundary.height}, image: createImage('./img/pipeVertical.png')}));
        } else if (symbol === '1') {
            boundaries.push(new Boundary({ position: {x: columnIndex * Boundary.width, y: rowIndex * Boundary.height}, image: createImage('./img/pipeCorner1.png')}));
        } else if (symbol === '2') {
            boundaries.push(new Boundary({ position: {x: columnIndex * Boundary.width, y: rowIndex * Boundary.height}, image: createImage('./img/pipeCorner2.png')}));
        } else if (symbol === '3') {
            boundaries.push(new Boundary({ position: {x: columnIndex * Boundary.width, y: rowIndex * Boundary.height}, image: createImage('./img/pipeCorner3.png')}));
        } else if (symbol === '4') {
            boundaries.push(new Boundary({ position: {x: columnIndex * Boundary.width, y: rowIndex * Boundary.height}, image: createImage('./img/pipeCorner4.png')}));
        } else if (symbol === 'b') {
            boundaries.push(new Boundary({ position: {x: columnIndex * Boundary.width, y: rowIndex * Boundary.height}, image: createImage('./img/block.png')}));
        } else if (symbol === '[') {
            boundaries.push(new Boundary({ position: {x: columnIndex * Boundary.width, y: rowIndex * Boundary.height}, image: createImage('./img/capLeft.png')}));
        } else if (symbol === ']') {
            boundaries.push(new Boundary({ position: {x: columnIndex * Boundary.width, y: rowIndex * Boundary.height}, image: createImage('./img/capRight.png')}));
        } else if (symbol === '_') {
            boundaries.push(new Boundary({ position: {x: columnIndex * Boundary.width, y: rowIndex * Boundary.height}, image: createImage('./img/capBottom.png')}));
        } else if (symbol === '^') {
            boundaries.push(new Boundary({ position: {x: columnIndex * Boundary.width, y: rowIndex * Boundary.height}, image: createImage('./img/capTop.png')}));
        } else if (symbol === '+') {
            boundaries.push(new Boundary({ position: {x: columnIndex * Boundary.width, y: rowIndex * Boundary.height}, image: createImage('./img/pipeCross.png')}));
        } else if (symbol === '5') {
            boundaries.push(new Boundary({ position: {x: columnIndex * Boundary.width, y: rowIndex * Boundary.height}, image: createImage('./img/pipeConnectorTop.png')}));
        } else if (symbol === '6') {
            boundaries.push(new Boundary({ position: {x: columnIndex * Boundary.width, y: rowIndex * Boundary.height}, image: createImage('./img/pipeConnectorRight.png')}));
        } else if (symbol === '7') {
            boundaries.push(new Boundary({ position: {x: columnIndex * Boundary.width, y: rowIndex * Boundary.height}, image: createImage('./img/pipeConnectorBottom.png')}));
        } else if (symbol === '8') {
            boundaries.push(new Boundary({ position: {x: columnIndex * Boundary.width, y: rowIndex * Boundary.height}, image: createImage('./img/pipeConnectorLeft.png')}));
        } else if (symbol === '.') {
            pellets.push(new Pellet({ position: {x: columnIndex * Boundary.width + Boundary.width/2, y: rowIndex * Boundary.height + Boundary.height/2}}));
        }
    });
});


function circleCollidesWithRectangle({ circle, rectangle }) {
    const futureCircleX = circle.position.x + circle.velocity.x;
    const futureCircleY = circle.position.y + circle.velocity.y;

    const closestX = Math.max(rectangle.position.x, Math.min(futureCircleX, rectangle.position.x + rectangle.width));
    const closestY = Math.max(rectangle.position.y, Math.min(futureCircleY, rectangle.position.y + rectangle.height));

    const distanceX = futureCircleX - closestX;
    const distanceY = futureCircleY - closestY;

    return (distanceX * distanceX + distanceY * distanceY) < (circle.radius * circle.radius);
}

let gameOver = false;

function animate() {
    if (!gameOver) {
        requestAnimationFrame(animate)
        c.clearRect(0,0,canvas.width,canvas.height)

        if(keys.down.pressed && lastKey === 'down'){
            for (let i = 0; i < boundaries.length; i++) {
                const boundary = boundaries[i]
                if(circleCollidesWithRectangle({circle: {...player, velocity:{x: 0, y:  5}}, rectangle: boundary})){
                    player.velocity.y = 0
                    break
                }else{
                    player.velocity.y = 5
                }   
            }
        } else if(keys.up.pressed && lastKey === 'up'){
            for (let i = 0; i < boundaries.length; i++) {
                const boundary = boundaries[i]
                if(circleCollidesWithRectangle({circle: {...player, velocity:{x: 0, y: -5}}, rectangle: boundary})){
                    player.velocity.y = 0
                    break
                }else{
                    player.velocity.y = -5
                }   
            }
        } else if(keys.left.pressed && lastKey === 'left'){
            for (let i = 0; i < boundaries.length; i++) {
                const boundary = boundaries[i]
                if(circleCollidesWithRectangle({circle: {...player, velocity:{x: -5, y:  0}}, rectangle: boundary})){
                    player.velocity.x = 0
                    break
                }else{
                    player.velocity.x = -5
                }   
            }
        } else if(keys.right.pressed && lastKey === 'right'){
            for (let i = 0; i < boundaries.length; i++) {
                const boundary = boundaries[i]
                if(circleCollidesWithRectangle({circle: {...player, velocity:{x: 5, y:  0}}, rectangle: boundary})){
                    player.velocity.x = 0
                    break
                }else{
                    player.velocity.x = 5
                }   
            }
        }

        for(let i = pellets.length - 1; 0 < i; i--){
            const pellet = pellets[i]
            pellet.draw();    

            const distance = Math.hypot(pellet.position.x - player.position.x, pellet.position.y - player.position.y);

            if (distance < pellet.radius + player.radius) {
                pellets.splice(i, 1); 
                score += 10
                document.getElementById('scoreEl').innerText = score;
            }
        }
    
        boundaries.forEach(boundary => {
            boundary.draw();

            if(circleCollidesWithRectangle({circle: player, rectangle: boundary})){
                    player.velocity.x = 0
                    player.velocity.y = 0
            }

        });
        
        player.update()

        player.velocity.y = 0
        player.velocity.x = 0

        ghosts.forEach(ghost => ghost.update(player.position));
        
        boundaries.forEach(boundary => boundary.draw());

    } else {
            handleGameOver();
        }
}

animate()


function handleGameOver() {
    c.fillStyle = 'rgba(0, 0, 0, 0.5)'; 
    c.fillRect(0, 0, canvas.width, canvas.height);
    
    c.fillStyle = "red";
    c.font = "20px 'Press Start 2P'";
    c.textAlign = "center";
    c.fillText("Game Over!", canvas.width / 2, canvas.height / 2);
    c.fillText("Score: " + score, canvas.width / 2, canvas.height / 2 + 40);
}


function oppositeDirection(dir) {
    switch(dir) {
        case 'left': return 'right';
        case 'right': return 'left';
        case 'up': return 'down';
        case 'down': return 'up';
    }
}


function updateVelocity(ghost, direction) {
    switch (direction) {
        case 'left':
            ghost.velocity = {x: -3, y: 0};
            break;
        case 'right':
            ghost.velocity = {x: 3, y: 0};
            break;
        case 'up':
            ghost.velocity = {x: 0, y: -3};
            break;
        case 'down':
            ghost.velocity = {x: 0, y: 3};
            break;
    }
}

document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowUp':
            keys.up.pressed = true
            lastKey = 'up'
            break;
        case 'ArrowDown':
            keys.down.pressed = true
            lastKey = 'down'
            break;
        case 'ArrowLeft':
            keys.left.pressed = true
            lastKey = 'left'
            break;
        case 'ArrowRight':
            keys.right.pressed = true
            lastKey = 'right'
            break;
        default:
            break;
    }
});

document.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'ArrowUp':
            keys.up.pressed = false
            break;
        case 'ArrowDown':
            keys.down.pressed = false
            break;
        case 'ArrowLeft':
            keys.left.pressed = false
            break;
        case 'ArrowRight':
            keys.right.pressed = false
            break;
        default:
            break;
    }
});