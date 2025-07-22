const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const missionObjectiveElement = document.getElementById('missionObjective');
const gameContainer = document.getElementById('gameContainer');
const missionSelection = document.getElementById('missionSelection');
const trophyElement = document.getElementById('trophy');
const gameOverModalElement = document.getElementById('gameOverModal');
const gameOverModal = new bootstrap.Modal(gameOverModalElement, { keyboard: false, backdrop: 'static' });
const gameOverModalLabel = document.getElementById('gameOverModalLabel');
const upBtn = document.getElementById('upBtn');
const downBtn = document.getElementById('downBtn');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const missionButtons = document.querySelectorAll('.missionButton');
const gridSize = 20;
let snake = [];
let food = {};
let direction = 'right';
let score = 0;
let gameOver = false;
let gameSpeed = 150;
let gameInterval;
let currentMission = { type: 'endless', goal: 0, text: 'Endless Mode' };
let obstacles = [];

function generateFood() {
    do {
        food = {
            x: Math.floor(Math.random() * (canvas.width / gridSize)),
            y: Math.floor(Math.random() * (canvas.height / gridSize))
        };
    } while (snake.some(segment => segment.x === food.x && segment.y === food.y) || obstacles.some(obstacle => obstacle.x === food.x && obstacle.y === food.y));
}

function generateObstacle() {
    obstacles = []; // Clear existing obstacles
    const obstacleCount = Math.floor(Math.random() * 4) + 2; // Randomly generate 2 to 5 obstacles
    for (let i = 0; i < obstacleCount; i++) {
        let obstacle;
        do {
            obstacle = {
                x: Math.floor(Math.random() * (canvas.width / gridSize)),
                y: Math.floor(Math.random() * (canvas.height / gridSize))
            };
        } while (snake.some(segment => segment.x === obstacle.x && segment.y === obstacle.y) || (food.x === obstacle.x && food.y === obstacle.y) || obstacles.some(o => o.x === obstacle.x && o.y === obstacle.y));
        obstacles.push(obstacle);
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = i === 0 ? 'green' : 'lime';
        ctx.fillRect(snake[i].x * gridSize, snake[i].y * gridSize, gridSize, gridSize);
    }
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);

    ctx.fillStyle = 'black';
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x * gridSize, obstacle.y * gridSize, gridSize, gridSize);
    });
}

function update() {
    if (gameOver) return;

    const head = { x: snake[0].x, y: snake[0].y };
    switch (direction) {
        case 'up': head.y--; break;
        case 'down': head.y++; break;
        case 'left': head.x--; break;
        case 'right': head.x++; break;
    }
    // Wall teleportation
    if (head.x < 0) head.x = (canvas.width / gridSize) - 1;
    if (head.x >= canvas.width / gridSize) head.x = 0;
    if (head.y < 0) head.y = (canvas.height / gridSize) - 1;
    if (head.y >= canvas.height / gridSize) head.y = 0;

    // Check for collision with self
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            endGame(false);
            return;
        }
    }

    // Check for collision with obstacles
    if (obstacles.some(obstacle => head.x === obstacle.x && head.y === obstacle.y)) {
        endGame(false);
        return;
    }

    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreElement.textContent = 'Score: ' + score;
        generateFood();
        generateObstacle(); // Generate new obstacle when food is eaten
    } else {
        snake.pop();
    }
    checkMissionCompletion();
}

function checkMissionCompletion() {
    if (currentMission.type === 'score' && score >= currentMission.goal) {
        endGame(true);
    } else if (currentMission.type === 'length' && snake.length >= currentMission.goal) {
        endGame(true);
    }
}

function endGame(missionCompleted) {
    gameOver = true;
    clearInterval(gameInterval);
    if (missionCompleted) {
        gameOverModalLabel.textContent = 'Mission Complete!';
        trophyElement.style.display = 'block';
    } else {
        gameOverModalLabel.textContent = 'Game Over!';
        trophyElement.style.display = 'none';
    }
    gameOverModal.show();
}

function startGame(mission) {
    currentMission = mission;
    missionSelection.style.display = 'none';
    gameContainer.style.display = 'block';
    missionObjectiveElement.textContent = `Mission: ${mission.text}`;
    restartGame();
}

function restartGame() {
    gameSpeed = 55; // Set a constant speed
    gameOver = false;
    snake = [{ x: Math.floor((canvas.width / gridSize) / 2), y: Math.floor((canvas.height / gridSize) / 2) }];
    direction = 'right';
    score = 0;
    scoreElement.textContent = 'Score: 0';
    obstacles = [];
    generateFood();
    generateObstacle();
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, gameSpeed);
}

function gameLoop() {
    update();
    draw();
}

function handleDirectionChange(newDirection) {
    const oppositeDirections = { 'up': 'down', 'down': 'up', 'left': 'right', 'right': 'left' };
    if (direction !== oppositeDirections[newDirection] && !gameOver) {
        direction = newDirection;
    }
}

upBtn.addEventListener('click', () => handleDirectionChange('up'));
downBtn.addEventListener('click', () => handleDirectionChange('down'));
leftBtn.addEventListener('click', () => handleDirectionChange('left'));
rightBtn.addEventListener('click', () => handleDirectionChange('right'));

document.addEventListener('keydown', e => {
    switch (e.key) {
        case 'ArrowUp': handleDirectionChange('up'); break;
        case 'ArrowDown': handleDirectionChange('down'); break;
        case 'ArrowLeft': handleDirectionChange('left'); break;
        case 'ArrowRight': handleDirectionChange('right'); break;
    }
});

missionButtons.forEach(button => {
    button.addEventListener('click', () => {
        const type = button.dataset.type;
        const goal = parseInt(button.dataset.goal);
        const text = button.textContent;
        startGame({ type, goal, text });
    });
});

gameOverModalElement.addEventListener('click', () => {
    if (gameOver) {
        gameOverModal.hide();
        gameContainer.style.display = 'none';
        missionSelection.style.display = 'block';
    }
});

function resizeCanvas() {
    const size = Math.min(window.innerWidth * 0.9, window.innerHeight * 0.6);
    canvas.width = Math.floor(size / gridSize) * gridSize;
    canvas.height = canvas.width;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
// Remove this line: 
