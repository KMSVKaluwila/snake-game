const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const trophyElement = document.getElementById('trophy');
const missionSelection = document.getElementById('missionSelection');
const gameContainer = document.getElementById('gameContainer');
const missionObjectiveElement = document.getElementById('missionObjective');
const missionButtons = document.querySelectorAll('.missionButton');
const gameOverModalElement = document.getElementById('gameOverModal');
const gameOverModal = new bootstrap.Modal(gameOverModalElement);
const gameOverModalLabel = document.getElementById('gameOverModalLabel');

const upBtn = document.getElementById('upBtn');
const downBtn = document.getElementById('downBtn');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');


const gridSize = 20;
let snake = [{ x: 10, y: 10 }];
let food = {};
let direction = 'right';
let score = 0;
let gameOver = false;
let gameInterval;
let currentMission = {};

function generateFood() {
    food = {
        x: Math.floor(Math.random() * (canvas.width / gridSize)),
        y: Math.floor(Math.random() * (canvas.height / gridSize))
    };
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = i === 0 ? 'green' : 'lime';
        ctx.fillRect(snake[i].x * gridSize, snake[i].y * gridSize, gridSize, gridSize);
    }

    ctx.fillStyle = 'red';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
}

function update() {
    if (gameOver) {
        return;
    }

    const head = { x: snake[0].x, y: snake[0].y };

    switch (direction) {
        case 'up':
            head.y--;
            break;
        case 'down':
            head.y++;
            break;
        case 'left':
            head.x--;
            break;
        case 'right':
            head.x++;
            break;
    }

    if (head.x < 0 || head.x >= canvas.width / gridSize || head.y < 0 || head.y >= canvas.height / gridSize) {
        endGame(false);
        return;
    }

    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            endGame(false);
            return;
        }
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreElement.textContent = 'Score: ' + score;
        generateFood();
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

    if (mission.type === 'endless') {
        missionObjectiveElement.textContent = 'Mission: Endless Mode';
    } else {
        missionObjectiveElement.textContent = `Mission: ${mission.text}`;
    }
    
    restartGame();
}

function restartGame() {
    snake = [{ x: 10, y: 10 }];
    direction = 'right';
    score = 0;
    scoreElement.textContent = 'Score: 0';
    gameOver = false;
    trophyElement.style.display = 'none';
    generateFood();
    gameInterval = setInterval(gameLoop, 100);
}

function gameLoop() {
    update();
    draw();
}

function handleDirectionChange(newDirection) {
    const oppositeDirections = {
        'up': 'down',
        'down': 'up',
        'left': 'right',
        'right': 'left'
    };

    if (direction !== oppositeDirections[newDirection]) {
        direction = newDirection;
    }
}

document.addEventListener('keydown', e => {
    if (gameOver && e.key === 'Enter') {
        gameOverModal.hide();
        gameContainer.style.display = 'none';
        missionSelection.style.display = 'block';
        return;
    }

    switch (e.key) {
        case 'ArrowUp':
            handleDirectionChange('up');
            break;
        case 'ArrowDown':
            handleDirectionChange('down');
            break;
        case 'ArrowLeft':
            handleDirectionChange('left');
            break;
        case 'ArrowRight':
            handleDirectionChange('right');
            break;
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

upBtn.addEventListener('click', () => handleDirectionChange('up'));
downBtn.addEventListener('click', () => handleDirectionChange('down'));
leftBtn.addEventListener('click', () => handleDirectionChange('left'));
rightBtn.addEventListener('click', () => handleDirectionChange('right'));

function resizeCanvas() {
    const size = Math.min(window.innerWidth * 0.9, window.innerHeight * 0.6);
    canvas.width = Math.floor(size / gridSize) * gridSize;
    canvas.height = canvas.width;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
