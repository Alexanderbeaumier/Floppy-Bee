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
let wallSpawnInterval = 1500;  // Base interval between wall spawns in milliseconds
let wallTimer;
let powerUpTimer;

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
    powerUpImg.src = "images/PowerUp.png"; // Make sure the path is correct

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
    requestAnimationFrame(update);
};

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
        wall.x += velocity;  // Walls move faster with increasing difficulty
        context.drawImage(wallImg, wall.x, wall.y, wall.width, wall.height);

        if (wall.x + wall.width < 0) {
            wallArray.splice(index, 1);
        }

        if (wall.x + wall.width < bee.x && !wall.passed) {
            wall.passed = true;
            score++;
            document.getElementById("scoreDisplay").innerText = "Your score: " + score;
        }
    });
}

function updatePowerUps() {
    powerUps.forEach((powerUp, index) => {
        powerUp.x += powerUpSpeed; // Move power-ups left towards the bee
        context.drawImage(powerUpImg, powerUp.x, powerUp.y, 30, 30);

        if (powerUp.x + 30 < 0) {
            powerUps.splice(index, 1); // Remove if it goes off-screen
        }
    });
}

function checkCollisions() {
    const hitboxMargin = 5; // Margin to reduce the hitbox size

    wallArray.forEach(wall => {
        if (bee.x + bee.width - hitboxMargin > wall.x + hitboxMargin && 
            bee.x + hitboxMargin < wall.x + wall.width - hitboxMargin &&
            bee.y + bee.height - hitboxMargin > wall.y + hitboxMargin && 
            bee.y + hitboxMargin < wall.y + wall.height - hitboxMargin) {
            if (powerUpCount > 0) {
                powerUpCount--;  // Use one power-up to avoid this collision
                wallArray.splice(wallArray.indexOf(wall), 1);  // Remove the wall that was hit
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
            powerUpCount++;  // Increment power-up count
            powerUps.splice(index, 1); // Collect power-up and remove it
        }
    });
}

function placeWall() {
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

function startWallSpawn() {
    wallTimer = setInterval(placeWall, wallSpawnInterval);
}

function startPowerUpSpawn() {
    powerUpTimer = setInterval(placePowerUp, 10000); // Place a power-up every 10 seconds
}

function placePowerUp() {
    let randomPowerUpX = boardWidth; // Start at the far right of the canvas
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
    context.fillText("Power-ups: " + powerUpCount, boardWidth - 150, 30); // Display power-up count on top right
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
    wallSpawnInterval = 1500;
    clearInterval(wallTimer);
    startWallSpawn();
    document.getElementById("gameOverPopup").style.display = 'none';
    requestAnimationFrame(update);
}
