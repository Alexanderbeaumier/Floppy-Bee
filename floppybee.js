let board;
let boardWidth = 640;
let boardHeight = 880;
let context;

let beeWidth = 50;
let beeHeight = 35;
let beeX = boardWidth / 8;
let beeY = boardHeight / 2;
let beeImg;
let beeVelocityY = 0;
let gravity = 0.6;
let powerUpCount = 0;  // Counter for collected power-ups

let bee = {
    x: beeX,
    y: beeY,
    width: beeWidth,
    height: beeHeight
};

let wallArray = [];
let powerUps = [];
let wallWidth = 64;
let wallHeight = 128;
let wallX = boardWidth;
let wallImg;
let powerUpImg;
let powerUpSpeed = -1.5; // Speed at which power-ups move towards the bee

let gameOver = false;
let score = 0;
let highScore = 0;
let velocity = -2;  // Base velocity for walls
let wallSpawnInterval = 1500;  // Initial interval between wall spawns in milliseconds
let wallTimer;
let powerUpTimer;
let beeSpeedIncreaseInterval = 10000; // Interval to increase bee's speed
let beeSpeedTimer;

window.onload = function() {
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d");

    beeImg = new Image();
    beeImg.src = "images/Bee.png";

    wallImg = new Image();
    wallImg.src = "images/Wall.png";

    powerUpImg = new Image();
    powerUpImg.src = "images/PowerUp.png"; // Ensure the path is correct

    document.addEventListener('keydown', function(event) {
        if (event.key === " " || event.key === "Spacebar") {
            beeVelocityY = -10;
        }
    });

    document.addEventListener('mousedown', function() {
        beeVelocityY = -10;
    });

    startWallSpawn();
    startPowerUpSpawn();
    startBeeSpeedTimer();
    requestAnimationFrame(update);
};

function startBeeSpeedTimer() {
    beeSpeedTimer = setInterval(function() {
        beeVelocityY -= 0.5; // Gradually increase bee's falling speed
    }, beeSpeedIncreaseInterval);
}

function update() {
    if (gameOver) {
        displayGameOverPopup();
        return;
    }
    requestAnimationFrame(update);
    context.clearRect(0, 0, boardWidth, boardHeight);

    updateBee();
    updateWalls();
    updatePowerUps();
    checkCollisions();
    displayPowerUpCount();  // Display power-up count
}

function updateBee() {
    beeVelocityY += gravity;
    bee.y += beeVelocityY;

    if (bee.y > boardHeight || bee.y + beeHeight < 0) {
        gameOver = true;
    }

    context.drawImage(beeImg, bee.x, bee.y, bee.width, bee.height);
}

function updateWalls() {
    wallArray.forEach((wall, index) => {
        wall.x += velocity;
        context.drawImage(wallImg, wall.x, wall.y, wall.width, wall.height);

        if (wall.x + wall.width < 0) {
            wallArray.splice(index, 1);
        }

        if (wall.x + wall.width < bee.x && !wall.passed) {
            wall.passed = true;
            score++;
            document.getElementById("scoreDisplay").innerText = "Your score: " + score;
            adjustGameDifficulty();
        }
    });
}

function adjustGameDifficulty() {
    if (score % 10 === 0 && score !== 0) {
        velocity -= 0.5; // Increase wall speed
        if (wallSpawnInterval > 800) {
            wallSpawnInterval *= 0.9;
            clearInterval(wallTimer);
            startWallSpawn();
        }
    }
    if (score % 35 === 0 && score !== 0) {
        placeExtraWall();
    }
}

function placeExtraWall() {
    placeWall();
    placeWall();
}

function updatePowerUps() {
    powerUps.forEach((powerUp, index) => {
        powerUp.x += powerUpSpeed;
        context.drawImage(powerUpImg, powerUp.x, powerUp.y, 30, 30);

        if (powerUp.x + 30 < 0) {
            powerUps.splice(index, 1);
        }
    });
}

function checkCollisions() {
    const hitboxMargin = 7; // Margin to reduce the hitbox size
    wallArray.forEach(wall => {
        if (bee.x + bee.width - hitboxMargin > wall.x + hitboxMargin &&
            bee.x + hitboxMargin < wall.x + wall.width - hitboxMargin &&
            bee.y + bee.height - hitboxMargin > wall.y + hitboxMargin &&
            bee.y + hitboxMargin < wall.y + wall.height - hitboxMargin) {
            if (powerUpCount > 0) {
                powerUpCount--;
                wallArray.splice(wallArray.indexOf(wall), 1);
            } else {
                gameOver = true;
            }
        }
    });

    powerUps.forEach((powerUp, index) => {
        if (bee.x + bee.width - hitboxMargin > powerUp.x + hitboxMargin &&
            bee.x + hitboxMargin < powerUp.x + 30 - hitboxMargin &&
            bee.y + bee.height - hitboxMargin > powerUp.y + hitboxMargin &&
            bee.y + hitboxMargin < powerUp.y + 30 - hitboxMargin) {
            powerUpCount++;
            powerUps.splice(index, 1);
        }
    });
}

function placeWall() {
    // Can change the number of walls to be placed at once
    for (let i = 0; i < 2; i++) {
        let randomWallY = Math.random() * (boardHeight - wallHeight);
        let wall = {
            img: wallImg,
            x: wallX,
            y: randomWallY,
            width: wallWidth,
            height: wallHeight,
            passed: false
        };
        wallArray.push(wall);
    }
}

function startWallSpawn() {
    wallTimer = setInterval(placeWall, wallSpawnInterval);
}

function startPowerUpSpawn() {
    powerUpTimer = setInterval(placePowerUp, 15000); // Place a power-up every 15 seconds
}

function placePowerUp() {
    let randomPowerUpX = boardWidth;
    let randomPowerUpY = Math.random() * (boardHeight - 30);
    let powerUp = {
        x: randomPowerUpX,
        y: randomPowerUpY
    };
    powerUps.push(powerUp);
}

function displayPowerUpCount() {
    context.font = "18px Arial";
    context.fillStyle = "black";
    context.fillText("Flowers: " + powerUpCount, boardWidth - 150, 30);
}

function displayGameOverPopup() {
    highScore = Math.max(score, highScore);
    document.getElementById("scoreDisplay").innerText = `Game Over! Your score: ${score}. High score: ${highScore}`;
    document.getElementById("gameOverPopup").style.display = "block";
}

function restartGame() {
    score = 0;  
    gameOver = false;
    bee.y = beeY;
    wallArray = [];
    powerUps = []; 
    powerUpCount = 0;
    velocity = -2;
    wallSpawnInterval = 1300;
    clearInterval(wallTimer);
    startWallSpawn();
    document.getElementById("gameOverPopup").style.display = 'none';
    requestAnimationFrame(update);
}
