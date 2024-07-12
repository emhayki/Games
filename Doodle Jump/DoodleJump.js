const boardWidth = 532;
const boardHeight = 851;
const gravity = 0.5;
const initialVelocityY = -15;
const platformHeight = 24;
const platformWidth = 90;
const minVerticalSpacing = 100;
const maxVerticalSpacing = 120;
const horizontalMargin = 20; 

class Doodler {
    constructor(images, x, y, width, height) {
        this.images = images;
        this.image = images[0];
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.velocityX = 0;
        this.velocityY = initialVelocityY;
        this.highestY = y;
    }

    move() {
        this.x += this.velocityX;
        this.velocityY += gravity;
    }

    draw(context) {
        context.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    checkWrapAround(maxWidth) {
        if (this.x > maxWidth - this.width) {
            this.x = 0;
        } else if (this.x < 0) {
            this.x = maxWidth - this.width;
        }
    }

    isFalling() {
        return this.velocityY > 0;
    }

    changeImage(direction) {
        if (direction === 'left') {
            this.image = this.images[1];
        } else if (direction === 'right') {
            this.image = this.images[0];
        }
    }
}

class Platform {
    constructor(image, x, y, width, height) {
        this.image = image;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    draw(context) {
        context.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

class Game {
    constructor(context) {
        this.context = context;
        this.platforms = [];
        this.doodler = null;
        this.gameOver = false;
        this.score = 0;
        this.highestY = boardHeight / 2 - 50;
        this.loadImages();
    }

    loadImages() {
        const urls = ["./DRight.png", "./DLeft.png", "./white_platform.png"];
        const images = urls.map(url => {
            const img = new Image();
            img.src = url;
            return img;
        });

        Promise.all(images.map(img => new Promise((resolve) => img.onload = resolve))).then(() => {
            this.startGame(images);
        });
    }

    startGame(images) {
        this.doodler = new Doodler([images[0], images[1]], boardWidth / 2 - 50 / 2, boardHeight / 2 - 50, 75, 75);
        this.placeInitialPlatforms(images[2]);
        requestAnimationFrame(() => this.update());
        document.addEventListener("keydown", this.moveDoodler.bind(this));
        document.addEventListener("keyup", this.stopDoodler.bind(this));
        this.addTouchControls();
    }

    placeInitialPlatforms(platformImage) {
        let posY = boardHeight - platformHeight;

        for (let i = 0; i < 3; i++) {
            let posX;
            do {
                posX = Math.random() * (boardWidth - platformWidth - 2 * horizontalMargin) + horizontalMargin;
            } while (this.isOverlapping(posX, posY));

            const spacing = Math.random() * (maxVerticalSpacing - minVerticalSpacing) + minVerticalSpacing;
            posY -= spacing;
            this.platforms.push(new Platform(platformImage, posX, posY, platformWidth, platformHeight));
        }
    }

    isOverlapping(x, y) {
        return this.platforms.some(platform => 
            x < platform.x + platform.width && 
            x + platformWidth > platform.x && 
            y < platform.y + platform.height && 
            y + platformHeight > platform.y
        );
    }

    addNewPlatform(platformImage) {
        let posX, posY = -platformHeight;
        do {
            posX = Math.random() * (boardWidth - platformWidth - 2 * horizontalMargin) + horizontalMargin;
        } while (this.isOverlapping(posX, posY));

        const lastPlatformY = this.platforms[this.platforms.length - 1].y;
        const spacing = Math.random() * (maxVerticalSpacing - minVerticalSpacing) + minVerticalSpacing;
        posY = lastPlatformY - spacing;
        this.platforms.push(new Platform(platformImage, posX, posY, platformWidth, platformHeight));
    }

    moveDoodler(event) {
        if (this.gameOver) return;
        if (event.code === "ArrowRight" || event.code === "KeyD") {
            this.doodler.velocityX = 4;
            this.doodler.changeImage('right');
        } else if (event.code === "ArrowLeft" || event.code === "KeyA") {
            this.doodler.velocityX = -4;
            this.doodler.changeImage('left');
        }
    }

    stopDoodler(event) {
        if (this.gameOver) return;
        if (event.code === "ArrowRight" || event.code === "KeyD" || event.code === "ArrowLeft" || event.code === "KeyA") {
            this.doodler.velocityX = 0;
        }
    }

    addTouchControls() {
        document.body.addEventListener("touchstart", this.handleTouchStart.bind(this));
        document.body.addEventListener("touchend", this.handleTouchEnd.bind(this));
    }

    handleTouchStart(event) {
        if (this.gameOver) return;
        const touchX = event.touches[0].clientX;
        if (touchX < window.innerWidth / 2) {
            this.doodler.velocityX = -4;
            this.doodler.changeImage('left');
        } else {
            this.doodler.velocityX = 4;
            this.doodler.changeImage('right');
        }
    }

    handleTouchEnd(event) {
        if (this.gameOver) return;
        this.doodler.velocityX = 0;
    }

    update() {
        if (this.gameOver) return;
        this.context.clearRect(0, 0, boardWidth, boardHeight);

        this.doodler.move();
        this.doodler.checkWrapAround(boardWidth);

        if (this.doodler.y + this.doodler.velocityY < this.highestY) {
            let offset = this.highestY - (this.doodler.y + this.doodler.velocityY);
            this.platforms.forEach(platform => {
                platform.y += offset;
            });
            this.doodler.y = this.highestY;
            this.score++;
        } else {
            this.doodler.y += this.doodler.velocityY;
        }

        this.platforms = this.platforms.filter(platform => platform.y <= boardHeight);
        while (this.platforms.length < 20) {
            this.addNewPlatform(this.platforms[0].image);
        }

        this.doodler.draw(this.context);
        this.platforms.forEach(platform => {
            if (this.doodler.isFalling() && this.detectCollision(this.doodler, platform)) {
                this.doodler.velocityY = initialVelocityY;
            }
            platform.draw(this.context);
        });

        if (this.doodler.y > boardHeight) {
            this.gameOver = true;
            this.displayGameOver();
            return;
        }

        this.displayScore();

        requestAnimationFrame(() => this.update());
    }

    displayGameOver() {
        this.context.fillStyle = "black";
        this.context.font = "30px Arial";
        this.context.fillText("Game Over!", boardWidth / 2 - 90, boardHeight / 2);
        this.context.fillText(`Score: ${this.score}`, boardWidth / 2 - 70, boardHeight / 2 + 40);
    }

    displayScore() {
        this.context.fillStyle = "black";
        this.context.font = "20px Arial";
        this.context.fillText(`Score: ${this.score}`, 10, 30);
    }

    detectCollision(doodler, platform) {
        let doodlerBottom = doodler.y + doodler.height;
        let platformTop = platform.y;
        return (
            doodler.x < platform.x + platform.width &&
            doodler.x + doodler.width > platform.x &&
            doodlerBottom < platformTop + 10 &&
            doodlerBottom + doodler.velocityY >= platformTop
        );
    }
}

window.onload = function() {
    const board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    const context = board.getContext('2d');
    new Game(context);
};
