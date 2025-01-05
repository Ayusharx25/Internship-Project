// script.js

// Selectors
const board = document.getElementById('board');
const statusDisplay = document.getElementById('status');
const resetButton = document.getElementById('reset-btn');
const cells = document.querySelectorAll('.cell');

// Game State
let currentPlayer = 'X';
let gameState = ['', '', '', '', '', '', '', '', '']; // 9 empty slots for the grid
let isGameActive = true;

// Winning Combinations
const winningConditions = [
  [0, 1, 2], // Top row
  [3, 4, 5], // Middle row
  [6, 7, 8], // Bottom row
  [0, 3, 6], // Left column
  [1, 4, 7], // Middle column
  [2, 5, 8], // Right column
  [0, 4, 8], // Diagonal 1
  [2, 4, 6], // Diagonal 2
];

// Update Status Message
function updateStatus(message) {
  statusDisplay.textContent = message;
}

// Check for Winner
function checkWinner() {
  let roundWon = false;

  for (let i = 0; i < winningConditions.length; i++) {
    const [a, b, c] = winningConditions[i];
    if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
      roundWon = true;
      break;
    }
  }

  if (roundWon) {
    updateStatus(`Player ${currentPlayer} Wins!`);
    isGameActive = false;
    return;
  }

  if (!gameState.includes('')) {
    updateStatus('It\'s a Tie!');
    isGameActive = false;
  }
}

// Handle Cell Click
function handleCellClick(e) {
  const cell = e.target;
  const cellIndex = cell.getAttribute('data-index');

  if (gameState[cellIndex] !== '' || !isGameActive) {
    return;
  }

  gameState[cellIndex] = currentPlayer;
  cell.textContent = currentPlayer;
  cell.classList.add('taken');

  checkWinner();

  if (isGameActive) {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateStatus(`Player ${currentPlayer}'s Turn`);
  }
}

// Reset Game
function resetGame() {
  gameState = ['', '', '', '', '', '', '', '', ''];
  currentPlayer = 'X';
  isGameActive = true;
  updateStatus(`Player X's Turn`);
  cells.forEach(cell => {
    cell.textContent = '';
    cell.classList.remove('taken');
  });
}

// Event Listeners
board.addEventListener('click', handleCellClick);
resetButton.addEventListener('click', resetGame);

// Initialize
updateStatus(`Player X's Turn`);
