const startBtn = document.querySelector("#startBtn");
const gridContainer = document.querySelector("#gridContainer");
const amountOfClicks = document.querySelector("#amountOfClicks");
const colorSelect = document.querySelector("#colorSelect");
const gridSelect = document.querySelector("#gridSelect");
const resultatMessage = document.querySelector("#resultatMessage");
const boxContainer = document.querySelector("#boxContainer");
const timer = document.querySelector("#timer");

let gameStarted = false;
let clicked = 0;
let boxes = [];
let colorAmount = 6;
let grid = 6;
let intervalId;

// colors for boxes
const colors = ["primary", "success", "danger", "warning", "info", "secondary", "light"];

// generate boxes array
const createBoxes = () => {
    boxes = Array.from({ length: grid*grid }, (_, i) => ({
        id: i + 1,
        marked: false,
        color: colors[Math.floor(Math.random() * colorAmount)],
    }));
}

// render boxes and clicks amount
const render = () => {
    amountOfClicks.textContent = clicked;
    
    boxContainer.innerHTML = boxes.map(({ id, color }) =>
        `<div class="box bg-${color}" data-id="${id}" data-color="${color}"></div>`
    ).join("");
};

// cheking if next box has same color and changing it if true
const changeColor = (newColor) => {
    const topLeftBox = boxes[0];
    topLeftBox.color = newColor;
    topLeftBox.marked = true;
    
    const checkColor = (box) => {
        if (box.color === newColor) {
            box.marked = true;
        };
    };
    
    const markBoxes = boxes.map((box) => {
        if (!box.marked) return { ...box };
        
        const markLeft = boxes[Math.max(box.id - 1, 1) - 1];
        const markRight = boxes[Math.min(box.id + 1, grid) - 1];
        const markTop = boxes[Math.max(box.id - grid, box.id) - 1];
        const markBottom = boxes[Math.min(box.id + grid, grid*grid) - 1];
                
        checkColor(markLeft);
        checkColor(markRight);
        checkColor(markTop);
        checkColor(markBottom);
        
        return { ...box };
    });
            
    boxes = markBoxes.map((box) => {
        if (!box.marked) return { ...box };
        return { ...box, color: newColor };
    });
    
    checkIfWin();
};

const gameOver = (message) => {
    resultatMessage.textContent = message;
    [gridSelect, colorSelect, startBtn].forEach(i => i.disabled = false);
    clearInterval(intervalId);
}

const checkIfWin = () => {
    const marked = boxes.map((box) => box.marked);
    if (!marked.includes(false)) {
        clearInterval(intervalId);
        gameOver("Jij bent een winnaar!");
    }
};

const startTimer = () => {
    let seconds = 60;
    intervalId = setInterval(() => {
        if (seconds < 0) {
            gameOver("De tijd is om!");
        } else {
            timer.textContent = String(seconds--).padStart(2, "0");
        }
    }, 1000);
};

startBtn.addEventListener("click", () => {   
    startTimer();
    
    resultatMessage.textContent = "";
    clicked = 0;
    
    grid = Number(gridSelect.value);
    colorAmount = Number(colorSelect.value);
        
    if (grid === 8) { gridContainer.style.width = "840px" }; 
    
    createBoxes();
    render();
    
    gameStarted = true;
    [gridSelect, colorSelect, startBtn].forEach((i) => (i.disabled = true));
});


boxContainer.addEventListener("click", (e) => {
    if (clicked >= 10) {
        gameOver("Spel voorbij!");
        return;
    }
    
    const box = e.target.closest(".box");
    if (!gameStarted || !box) return;
    
    clicked++;
    changeColor(box.dataset.color);
    
    render();
});
