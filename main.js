const startBtn = document.querySelector("#startBtn");
const nameInput = document.querySelector("#nameInput");
const gridContainer = document.querySelector("#gridContainer");
const amountOfClicks = document.querySelector("#amountOfClicks");
const colorSelect = document.querySelector("#colorSelect");
const gridSelect = document.querySelector("#gridSelect");
const resultatMessage = document.querySelector("#resultatMessage");
const boxContainer = document.querySelector("#boxContainer");
const timer = document.querySelector("#timer");
const leadersTable = document.querySelector("#leadersTable");

let gameStarted = false;
let clicked = 0;
let boxes = [];
let colorAmount = 6;
let grid = 6;
let intervalId;
let playerName;
let seconds = 60;

// colors for boxes
const colors = ["primary", "success", "danger", "warning", "info", "secondary", "light"];
const leaders = [];

// generate boxes array
const createBoxes = () => {
    boxes = Array.from({ length: grid * grid }, (_, i) => ({
        id: i + 1,
        marked: false,
        color: colors[Math.floor(Math.random() * colorAmount)],
    }));
}

// render boxes and clicks amount
const render = (animate = false) => {
    amountOfClicks.textContent = clicked;

    boxContainer.innerHTML = boxes.map(({ id, color }, index) =>
        `<div class="box bg-${color} ${animate ? "appear" : ""}" style="animation-delay: ${index * 20}ms"
            data-id="${id}" data-color="${color}"></div>`
    ).join("");
};

const renderLeaders = () => {
    leadersTable.innerHTML = leaders
        .sort((a, b) => Number(a.time) - Number(b.time))
        .map(({ name, time, clicks, isNew }) =>
            `<tr class="${isNew ? "new-entry" : ""}">
                <td>${name}</td>
                <td>${time}s</td>
                <td>${clicks}</td>
            </tr>`
        )
        .join("");

    leaders.forEach(leader => leader.isNew = false);
};

// checking if next box has same color and changing it if true
const changeColor = (newColor) => {
    const topLeftBox = boxes[0];
    topLeftBox.color = newColor;
    topLeftBox.marked = true;

    const checkColor = (box) => {
        if (!box || box.marked) return false;

        if (box.color === newColor) {
            box.marked = true;
            return true;
        };

        return false;
    };

    let markBoxes = boxes.map((box) => ({ ...box }));
    let left;
    let right;
    let top;
    let bottom;

    const checkNext = () => {
        let found = false;

        markBoxes.forEach((box) => {
            if (!box.marked) return;

            const markLeft = box.id % grid !== 1 ? markBoxes[box.id - 2] : null;
            const markRight = box.id % grid !== 0 ? markBoxes[box.id] : null;
            const markTop = box.id > grid ? markBoxes[box.id - grid - 1] : null;
            const markBottom = box.id <= grid * (grid - 1) ? markBoxes[box.id + grid - 1] : null;

            left = checkColor(markLeft);
            right = checkColor(markRight);
            top = checkColor(markTop);
            bottom = checkColor(markBottom);

            if (left || right || top || bottom) {
                found = true;
            }
        });

        return found;
    };

    while (checkNext()) {}

    boxes = markBoxes.map((box) => {
        if (!box.marked) return { ...box };
        return { ...box, color: newColor };
    });

    checkIfWin();
};

const gameOver = (message) => {
    resultatMessage.textContent = message;
    [nameInput, gridSelect, colorSelect, startBtn].forEach(i => i.disabled = false);
    seconds = 60;
    resultatMessage.classList.add("show");
    clearInterval(intervalId);
}

const checkIfWin = () => {
    const marked = boxes.map((box) => box.marked);
    if (!marked.includes(false)) {
        clearInterval(intervalId);

        leaders.push({ name: playerName, time: 60 - seconds, clicks: clicked, isNew: true });
        if (leaders.length > 5) {
            leaders.sort((a, b) => a.time - b.time);
            leaders.pop();
        }

        renderLeaders();
        gameOver("Jij bent een winnaar!");
    }
};

const startTimer = () => {
    intervalId = setInterval(() => {
        if (seconds < 0) {
            gameOver("De tijd is om!");
        } else {
            seconds--;
            timer.textContent = String(seconds).padStart(2, "0");
        }
    }, 1000);
};

startBtn.addEventListener("click", () => {
    startTimer();

    resultatMessage.textContent = "";
    resultatMessage.classList.remove("show");
    clicked = 0;

    grid = Number(gridSelect.value);
    colorAmount = Number(colorSelect.value);
    playerName = nameInput.value.trim() || "Naamloos";

    if (grid === 8) { gridContainer.style.width = "840px" };

    createBoxes();
    render(true);

    gameStarted = true;
    [nameInput, gridSelect, colorSelect, startBtn].forEach((i) => (i.disabled = true));
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
