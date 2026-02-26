const GRID_SIZE = 5;
let board = [];
let moves = 0;
let isAutoSolving = false;

function initGame() {
    board = [];
    moves = 0;
    isAutoSolving = false;
    document.getElementById('moves').textContent = moves;
    document.getElementById('win-message').classList.add('hidden');
    
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';
    
    for (let i = 0; i < GRID_SIZE; i++) {
        board[i] = [];
        for (let j = 0; j < GRID_SIZE; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.addEventListener('click', () => handleClick(i, j));
            gameBoard.appendChild(cell);
            board[i][j] = cell;
        }
    }
    
    scrambleBoard();
    updateDisplay();
}

function scrambleBoard() {
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            board[i][j].classList.remove('lit');
        }
    }
    
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            if (Math.random() > 0.5) {
                toggleCell(i, j);
            }
        }
    }
    
    if (isAllLit()) {
        scrambleBoard();
    }
}

function handleClick(row, col) {
    if (isAutoSolving) return;
    toggleCell(row, col);
    moves++;
    document.getElementById('moves').textContent = moves;
    updateDisplay();
    
    if (isAllLit()) {
        showWin();
    }
}

function toggleCell(row, col) {
    toggle(row, col);
    toggle(row - 1, col);
    toggle(row + 1, col);
    toggle(row, col - 1);
    toggle(row, col + 1);
}

function toggle(row, col) {
    if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
        board[row][col].classList.toggle('lit');
    }
}

function updateDisplay() {
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            const isLit = board[i][j].classList.contains('lit');
            board[i][j].classList.toggle('lit', isLit);
        }
    }
}

function isAllLit() {
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            if (!board[i][j].classList.contains('lit')) {
                return false;
            }
        }
    }
    return true;
}

function showWin() {
    document.getElementById('final-moves').textContent = moves;
    document.getElementById('win-message').classList.remove('hidden');
}

function getState() {
    const state = [];
    for (let i = 0; i < GRID_SIZE; i++) {
        state[i] = [];
        for (let j = 0; j < GRID_SIZE; j++) {
            state[i][j] = board[i][j].classList.contains('lit') ? 1 : 0;
        }
    }
    return state;
}

function simulateClick(state, row, col) {
    const newState = state.map(r => [...r]);
    const toggle = (r, c) => {
        if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
            newState[r][c] ^= 1;
        }
    };
    toggle(row, col);
    toggle(row - 1, col);
    toggle(row + 1, col);
    toggle(row, col - 1);
    toggle(row, col + 1);
    return newState;
}

function chaseTheLights(initialState, firstRowClicks) {
    let state = initialState.map(r => [...r]);
    const clicks = [];
    
    for (let j = 0; j < GRID_SIZE; j++) {
        if (firstRowClicks[j]) {
            state = simulateClick(state, 0, j);
            clicks.push({ row: 0, col: j });
        }
    }
    
    for (let i = 1; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            if (state[i-1][j] === 0) {
                state = simulateClick(state, i, j);
                clicks.push({ row: i, col: j });
            }
        }
    }
    
    let allLit = true;
    for (let j = 0; j < GRID_SIZE; j++) {
        if (state[GRID_SIZE-1][j] === 0) {
            allLit = false;
            break;
        }
    }
    
    return allLit ? clicks : null;
}

function solve() {
    const initialState = getState();
    
    for (let pattern = 0; pattern < 32; pattern++) {
        const firstRowClicks = [];
        for (let j = 0; j < GRID_SIZE; j++) {
            firstRowClicks[j] = (pattern >> j) & 1;
        }
        
        const solution = chaseTheLights(initialState, firstRowClicks);
        if (solution) {
            return solution;
        }
    }
    
    return [];
}

async function autoSolve() {
    if (isAutoSolving) return;
    
    if (isAllLit()) {
        alert('游戏已经完成了！');
        return;
    }
    
    isAutoSolving = true;
    const solution = solve();
    
    if (!solution || solution.length === 0) {
        alert('无法找到解决方案');
        isAutoSolving = false;
        return;
    }
    
    for (const move of solution) {
        await new Promise(resolve => setTimeout(resolve, 300));
        toggleCell(move.row, move.col);
        moves++;
        document.getElementById('moves').textContent = moves;
        updateDisplay();
    }
    
    showWin();
    isAutoSolving = false;
}

document.getElementById('restart').addEventListener('click', initGame);
document.getElementById('auto-solve').addEventListener('click', autoSolve);

initGame();
