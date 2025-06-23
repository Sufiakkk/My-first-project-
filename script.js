// ====== ELEMENT REFERENCES ======
const cells             = document.querySelectorAll('[data-cell]');
const board             = document.getElementById('board');
const winningMessage    = document.getElementById('winningMessage');
const winningMessageText= document.getElementById('winningMessageText');
const restartButton     = document.getElementById('restartButton');
const turnIndicator     = document.getElementById('turnIndicator');
const xWinsText         = document.getElementById('xWins');
const oWinsText         = document.getElementById('oWins');
const drawsText         = document.getElementById('draws');
const difficultySelect  = document.getElementById('difficultySelect');
const playerSelect      = document.getElementById('playerSelect');
const darkModeToggle    = document.getElementById('darkModeToggle');
const timerDisplay      = document.getElementById('timerDisplay');

const clickSound = document.getElementById('clickSound');
const winSound   = document.getElementById('winSound');

// ====== CONSTANTS ======
const X_CLASS = 'x';
const O_CLASS = 'o';
const WINNING_COMBINATIONS = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

// ====== STATE ======
let oTurn, timer, timeLeft;
let scores = { x: 0, o: 0, draws: 0 };
let aiDifficulty = "none";
let playerClass  = "x";  // human plays X by default

// ====== INIT ======
loadScores();
startGame();

// ====== EVENT LISTENERS ======
restartButton.addEventListener('click', startGame);
difficultySelect.addEventListener('change', () => {
  aiDifficulty = difficultySelect.value;
  startGame();
});
playerSelect.addEventListener('change', () => {
  playerClass = playerSelect.value;
  startGame();
});
darkModeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
});

// ====== GAME SETUP ======
function startGame() {
  // Determine who starts
  oTurn    = (playerClass === "x") ? false : true;
  timeLeft = 30;
  clearInterval(timer);
  updateTimerDisplay();

  cells.forEach(cell => {
    cell.classList.remove(X_CLASS, O_CLASS);
    cell.textContent = "";
    cell.removeEventListener('click', handleClick);
    cell.addEventListener('click', handleClick, { once: true });
    cell.style.backgroundColor = '';
  });

  winningMessage.classList.remove('show');
  updateTurnIndicator();
  startTimer();

  // If AI’s turn at start, make it move
  const aiTurnAtStart = !((!oTurn && playerClass==="x") || (oTurn && playerClass==="o"));
  // aiTurnAtStart is true exactly when oTurn===true and human is X? Actually simpler:
  if (aiDifficulty !== "none" && !((playerClass==="x" && !oTurn) || (playerClass==="o" && oTurn))) {
    // This shorthand means: if it's not human's turn
    setTimeout(aiMove, 300);
  }
}

// ====== PLAYER MOVE ======
function handleClick(e) {
  const cell = e.target;
  const currentClass = oTurn ? O_CLASS : X_CLASS;
  placeMark(cell, currentClass);
  playSound(clickSound);

  if (checkWin(currentClass)) {
    endGame(false);
  } else if (isDraw()) {
    endGame(true);
  } else {
    // toggle turn
    oTurn = !oTurn;
    updateTurnIndicator();
    resetTimer();

    // AI move if it's AI’s turn
    const humanTurn = (oTurn && playerClass==="o") || (!oTurn && playerClass==="x");
    if (!humanTurn && aiDifficulty !== "none") {
      setTimeout(aiMove, 300);
    }
  }
}

// ====== PLACE MARK ======
function placeMark(cell, cls) {
  cell.classList.add(cls);
  cell.textContent = cls === X_CLASS ? "X" : "O";
  cell.removeEventListener('click', handleClick);
}

// ====== TURN INDICATOR ======
function updateTurnIndicator() {
  const turn = oTurn ? "O" : "X";
  turnIndicator.textContent = `${turn}'s Turn`;
  speak(`${turn}'s turn`);
}

// ====== END GAME ======
function endGame(draw) {
  clearInterval(timer);
  let text;
  if (draw) {
    text = "It's a Draw!";
    scores.draws++;
  } else {
    const winner = oTurn ? "O" : "X";
    text = `${winner} Wins!`;
    winner === "X" ? scores.x++ : scores.o++;
    winConfetti();
    playSound(winSound);
    speak(`${winner} wins`);
  }
  saveScores();
  updateScoreboard();
  winningMessageText.textContent = text;
  winningMessage.classList.add('show');
}

// ====== DRAW CHECK ======
function isDraw() {
  return [...cells].every(c =>
    c.classList.contains(X_CLASS) || c.classList.contains(O_CLASS)
  );
}

// ====== WIN CHECK ======
function checkWin(cls) {
  return WINNING_COMBINATIONS.some(comb =>
    comb.every(i => cells[i].classList.contains(cls))
  );
}

// ====== SCOREBOARD ======
function updateScoreboard() {
  xWinsText.textContent = scores.x;
  oWinsText.textContent = scores.o;
  drawsText.textContent = scores.draws;
}
function saveScores() {
  localStorage.setItem('ttt-scores', JSON.stringify(scores));
}
function loadScores() {
  const saved = localStorage.getItem('ttt-scores');
  if (saved) scores = JSON.parse(saved);
  updateScoreboard();
}

// ====== SOUND & SPEECH ======
function playSound(audio) {
  audio.currentTime = 0;
  audio.play();
}
function speak(text) {
  if ('speechSynthesis' in window) {
    const u = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(u);
  }
}

// ====== CONFETTI ======
function winConfetti() {
  for (let i=0; i<100; i++){
    const d = document.createElement('div');
    d.textContent = "🎉";
    d.style.position = 'absolute';
    d.style.left     = Math.random()*100 + '%';
    d.style.top      = -20 + 'px';
    d.style.fontSize = 20 + 'px';
    d.style.animation = `fall ${Math.random()*3+2}s linear forwards`;
    document.body.appendChild(d);
    setTimeout(()=>d.remove(), 4000);
  }
}
const style = document.createElement('style');
style.textContent = `@keyframes fall { to {transform:translateY(100vh);opacity:0;} }`;
document.head.appendChild(style);

// ====== TIMER ======
function startTimer() {
  clearInterval(timer);
  timer = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    if (timeLeft <= 0) {
      clearInterval(timer);
      // Opponent wins by timeout
      const winner = (oTurn) ? (playerClass==="o"?"O":"X") : (playerClass==="x"?"X":"O");
      // Actually simpler: if on X's turn, timeout gives O, else X
      const winCls = oTurn ? X_CLASS : O_CLASS;
      placeMark(document.createElement('div'), winCls); // no UI, just increment
      scores[ winCls===X_CLASS?'x':'o' ]++;
      saveScores();
      updateScoreboard();
      winningMessageText.textContent = `${oTurn?"X":"O"} Wins by Timeout!`;
      winningMessage.classList.add('show');
      playSound(winSound);
      speak(`${oTurn?"X":"O"} wins by timeout`);
    }
  }, 1000);
}
function resetTimer() {
  timeLeft = 30;
  updateTimerDisplay();
  startTimer();
}
function updateTimerDisplay() {
  timerDisplay.textContent = `Time Left: ${timeLeft}s`;
}

// ====== AI LOGIC ======
function aiMove() {
  const available = [...cells].filter(c =>
    !c.classList.contains(X_CLASS) && !c.classList.contains(O_CLASS)
  );
  if (!available.length) return;

  let move;
  if (aiDifficulty==="easy") {
    move = available[Math.floor(Math.random()*available.length)];
  } else if (aiDifficulty==="medium") {
    move = greedyMove() || available[Math.floor(Math.random()*available.length)];
  } else {
    move = minimaxMove();
  }
  move.click();
}

function greedyMove() {
  // Try win
  for (let c of cells) {
    if (!c.classList.contains(X_CLASS) && !c.classList.contains(O_CLASS)) {
      c.classList.add(O_CLASS);
      if (checkWin(O_CLASS)) { c.classList.remove(O_CLASS); return c; }
      c.classList.remove(O_CLASS);
    }
  }
  // Block X
  for (let c of cells) {
    if (!c.classList.contains(X_CLASS) && !c.classList.contains(O_CLASS)) {
      c.classList.add(X_CLASS);
      if (checkWin(X_CLASS)) { c.classList.remove(X_CLASS); return c; }
      c.classList.remove(X_CLASS);
    }
  }
  return null;
}

function minimaxMove() {
  let bestScore = -Infinity, bestMove = null;
  cells.forEach(c => {
    if (!c.classList.contains(X_CLASS) && !c.classList.contains(O_CLASS)) {
      c.classList.add(O_CLASS);
      let score = minimax(false);
      c.classList.remove(O_CLASS);
      if (score > bestScore) {
        bestScore = score;
        bestMove = c;
      }
    }
  });
  return bestMove;
}

function minimax(isMaximizing) {
  if (checkWin(O_CLASS)) return  10;
  if (checkWin(X_CLASS)) return -10;
  if (isDraw())           return   0;

  let best = isMaximizing ? -Infinity : Infinity;
  cells.forEach(c => {
    if (!c.classList.contains(X_CLASS) && !c.classList.contains(O_CLASS)) {
      c.classList.add(isMaximizing ? O_CLASS : X_CLASS);
      let score = minimax(!isMaximizing);
      c.classList.remove(isMaximizing ? O_CLASS : X_CLASS);
      best = isMaximizing
        ? Math.max(score, best)
        : Math.min(score, best);
    }
  });
  return best;
}