const startBtn = document.getElementById('startBtn');
const game = document.getElementById('game');
const turnSpan = document.getElementById('turn');
const score1Span = document.getElementById('score1');
const score2Span = document.getElementById('score2');
const clickSound = document.getElementById('clickSound');
const boxSound = document.getElementById('boxSound');
const winSound = document.getElementById('winSound');
const aiSelect = document.getElementById('aiDifficulty');
const aiLabel = document.getElementById('aiLabel');
const modeSelect = document.getElementById('modeSelect');

let size, mode, difficulty, currentPlayer, boxes;

modeSelect.addEventListener('change', () => {
  const isAI = modeSelect.value === 'pve';
  aiSelect.style.display = isAI ? 'inline-block' : 'none';
  aiLabel.style.display = isAI ? 'inline-block' : 'none';
});

startBtn.addEventListener('click', initGame);

function initGame() {
  size = parseInt(document.getElementById('sizeSelect').value);
  mode = modeSelect.value;
  difficulty = aiSelect.value;
  currentPlayer = 1;
  boxes = [];
  score1Span.textContent = 0;
  score2Span.textContent = 0;
  turnSpan.textContent = currentPlayer;
  buildBoard();
  if (mode === 'pve' && currentPlayer === 2) aiMove();
}

function buildBoard() {
  game.innerHTML = '';
  const totalRows = size * 2 + 1;
  const totalCols = size * 2 + 1;
  game.style.gridTemplateColumns = `repeat(${totalCols}, auto)`;

  for (let r = 0; r < totalRows; r++) {
    for (let c = 0; c < totalCols; c++) {
      if (r % 2 === 0 && c % 2 === 0) addDot();
      else if (r % 2 === 0) addLine('h-line', r, c);
      else if (c % 2 === 0) addLine('v-line', r, c);
      else addBox(r, c);
    }
  }
}

function addDot() {
  const div = document.createElement('div');
  div.className = 'dot';
  game.appendChild(div);
}

function addLine(cls, r, c) {
  const line = document.createElement('div');
  line.className = `line ${cls}`;
  line.dataset.row = r;
  line.dataset.col = c;
  line.addEventListener('click', onLineClick);
  game.appendChild(line);
}

function addBox(r, c) {
  const box = document.createElement('div');
  box.className = 'box';
  box.dataset.row = r;
  box.dataset.col = c;
  boxes.push(box);
  game.appendChild(box);
}

function onLineClick() {
  if (this.classList.contains('selected')) return;
  clickSound.play();
  this.classList.add('selected');

  let gotBox = false;
  boxes.forEach(box => {
    const r = +box.dataset.row, c = +box.dataset.col;
    const lines = [
      selectLine(r-1, c), selectLine(r+1, c),
      selectLine(r, c-1), selectLine(r, c+1)
    ];
    if (lines.every(l => l && l.classList.contains('selected'))) {
      if (!box.classList.contains('player1') && !box.classList.contains('player2')) {
        box.classList.add(`player${currentPlayer}`);
        box.textContent = currentPlayer;
        boxSound.currentTime = 0;
        boxSound.play();
        updateScore();
        gotBox = true;
      }
    }
  });

  if (!gotBox) switchPlayer();
  if (mode === 'pve' && currentPlayer === 2) aiMove();
  checkGameOver();
}

function selectLine(r, c) {
  return document.querySelector(`.line[data-row="${r}"][data-col="${c}"]`);
}

function switchPlayer() {
  currentPlayer = 3 - currentPlayer;
  turnSpan.textContent = currentPlayer;
}

function updateScore() {
  const p1 = boxes.filter(b => b.classList.contains('player1')).length;
  const p2 = boxes.filter(b => b.classList.contains('player2')).length;
  score1Span.textContent = p1;
  score2Span.textContent = p2;
}

function checkGameOver() {
  if (boxes.every(b => b.classList.contains('player1') || b.classList.contains('player2'))) {
    winSound.play();
    setTimeout(() => {
      const p1 = +score1Span.textContent;
      const p2 = +score2Span.textContent;
      const result = p1 === p2 ? "It's a tie!" : `Player ${p1 > p2 ? 1 : 2} wins!`;
      alert(`Game Over!\nPlayer 1: ${p1}\nPlayer 2: ${p2}\n${result}`);
    }, 200);
  }
}

// ==================== AI SECTION ======================
function aiMove() {
  setTimeout(() => {
    const lines = Array.from(document.querySelectorAll('.line')).filter(l => !l.classList.contains('selected'));

    if (difficulty === 'random') {
      lines[Math.floor(Math.random() * lines.length)].click();
      return;
    }

    if (difficulty === 'greedy' || difficulty === 'unbeatable') {
      for (let line of lines) {
        line.classList.add('selected');
        let completes = boxes.some(box => {
          const r = +box.dataset.row, c = +box.dataset.col;
          const ls = [selectLine(r-1,c), selectLine(r+1,c), selectLine(r,c-1), selectLine(r,c+1)];
          return ls.every(l => l && l.classList.contains('selected')) && box.textContent === '';
        });
        line.classList.remove('selected');
        if (completes) { line.click(); return; }
      }
    }

    if (difficulty === 'unbeatable') {
      const smart = lines.filter(line => {
        line.classList.add('selected');
        const unsafe = boxes.some(box => {
          const r = +box.dataset.row, c = +box.dataset.col;
          const ls = [selectLine(r-1,c), selectLine(r+1,c), selectLine(r,c-1), selectLine(r,c+1)];
          return ls.filter(l => l && l.classList.contains('selected')).length === 3;
        });
        line.classList.remove('selected');
        return !unsafe;
      });
      if (smart.length) {
        smart[Math.floor(Math.random()*smart.length)].click();
        return;
      }
    }

    // fallback for greedy/unbeatable
    lines[Math.floor(Math.random() * lines.length)].click();
  }, 300);
}