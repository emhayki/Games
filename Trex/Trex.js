document.addEventListener('DOMContentLoaded', function() {
    const dino = document.querySelector('.dino');
    const grid = document.querySelector('.grid');
    const alertElement = document.getElementById('alert');
    let isGameover = false;
    let score = 0;
    let obstacleRate = 1000;

    function jump() {
        if (dino.classList.contains('jumping') || isGameover) return;
        dino.classList.add('jumping');
        let position = parseInt(window.getComputedStyle(dino).getPropertyValue('bottom'), 10);
        let upTimerId = setInterval(function() {
            if (position < 225) {
                position += 20;
                dino.style.bottom = position + 'px';
            } else {
                clearInterval(upTimerId);
                let downTimerId = setInterval(function() {
                    if (position > 0) {
                        position -= 10;
                        dino.style.bottom = position + 'px';
                    } else {
                        clearInterval(downTimerId);
                        dino.classList.remove('jumping');
                    }
                }, 20);
            }
        }, 20);
    }

    function generateObstacles() {
        let obstaclePosition = 1000;
        const obstacle = document.createElement('div');
        if (!isGameover) {
            obstacle.classList.add('obstacle');
            grid.appendChild(obstacle);
            obstacle.style.left = obstaclePosition + 'px';
        }

        let timerId = setInterval(function() {
            if (isGameover) clearInterval(timerId);
            obstaclePosition -= 10;
            obstacle.style.left = obstaclePosition + 'px';

            let dinoRect = dino.getBoundingClientRect();
            let obstacleRect = obstacle.getBoundingClientRect();

            if (obstacleRect.left <= dinoRect.right && obstacleRect.right >= dinoRect.left &&
                dinoRect.bottom > obstacleRect.top && dinoRect.top < obstacleRect.bottom) {
                gameOver();
            }

            if (obstacleRect.right < dinoRect.left && !obstacle.cleared) {
                score++;
                updateScore();
                obstacle.cleared = true; 
                obstacleRate = Math.max(500, obstacleRate - 100); 
                setTimeout(generateObstacles, obstacleRate);
            }
        }, 20);
    }

    function updateScore() {
        alertElement.innerText = `Score: ${score}`;
    }

    function gameOver() {
        isGameover = true;
        alertElement.innerText = 'Game Over!';
        grid.innerHTML = '';
    }

    document.addEventListener('keydown', function(e) {
        if (e.code === "Space" || e.key === " ") {
            jump();
        }
    });

    document.addEventListener('mousedown', jump);
    setTimeout(generateObstacles, obstacleRate);
});
