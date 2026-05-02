// Genera un tablero Futoshiki válido y sus restricciones de desigualdad

export const SIZES = { easy: 4, medium: 5, hard: 6 };

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function isValid(board, row, col, num, size) {
  for (let c = 0; c < size; c++) {
    if (c !== col && board[row][c] === num) return false;
  }
  for (let r = 0; r < size; r++) {
    if (r !== row && board[r][col] === num) return false;
  }
  return true;
}

function solve(board, size) {
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] === 0) {
        const nums = shuffle([...Array(size)].map((_, i) => i + 1));
        for (const num of nums) {
          if (isValid(board, r, c, num, size)) {
            board[r][c] = num;
            if (solve(board, size)) return true;
            board[r][c] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function generateSolution(size) {
  const board = Array.from({ length: size }, () => Array(size).fill(0));
  solve(board, size);
  return board;
}

function generateConstraints(solution, size, count) {
  const hConstraints = {};
  const vConstraints = {};
  const candidates = [];

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size - 1; c++) {
      candidates.push({ type: 'h', r, c });
    }
  }
  for (let r = 0; r < size - 1; r++) {
    for (let c = 0; c < size; c++) {
      candidates.push({ type: 'v', r, c });
    }
  }

  const chosen = shuffle(candidates).slice(0, count);

  for (const { type, r, c } of chosen) {
    if (type === 'h') {
      const left = solution[r][c];
      const right = solution[r][c + 1];
      hConstraints[`${r},${c}`] = left < right ? '<' : '>';
    } else {
      const top = solution[r][c];
      const bottom = solution[r + 1][c];
      vConstraints[`${r},${c}`] = top < bottom ? '<' : '>';
    }
  }

  return { hConstraints, vConstraints };
}

function createPuzzle(solution, size, clues) {
  const positions = shuffle(
    Array.from({ length: size * size }, (_, i) => i)
  );
  const puzzle = solution.map(row => [...row]);
  let removed = 0;
  const toRemove = size * size - clues;

  for (const pos of positions) {
    if (removed >= toRemove) break;
    const r = Math.floor(pos / size);
    const c = pos % size;
    puzzle[r][c] = 0;
    removed++;
  }
  return puzzle;
}

const DIFFICULTY_CONFIG = {
  easy:   { clues: 10, constraints: 6 },
  medium: { clues: 10, constraints: 8 },
  hard:   { clues: 8,  constraints: 10 },
};

export function generateGame(difficulty = 'easy') {
  const size = SIZES[difficulty];
  const { clues, constraints } = DIFFICULTY_CONFIG[difficulty];
  const solution = generateSolution(size);
  const puzzle = createPuzzle(solution, size, clues);
  const { hConstraints, vConstraints } = generateConstraints(solution, size, constraints);

  return { puzzle, solution, hConstraints, vConstraints, size };
}

export function checkConstraints(board, hConstraints, vConstraints, size) {
  const errors = new Set();

  for (const [key, op] of Object.entries(hConstraints)) {
    const [r, c] = key.split(',').map(Number);
    const left = board[r][c];
    const right = board[r][c + 1];
    if (left && right) {
      if (op === '<' && left >= right) {
        errors.add(`${r},${c}`); errors.add(`${r},${c + 1}`);
      }
      if (op === '>' && left <= right) {
        errors.add(`${r},${c}`); errors.add(`${r},${c + 1}`);
      }
    }
  }

  for (const [key, op] of Object.entries(vConstraints)) {
    const [r, c] = key.split(',').map(Number);
    const top = board[r][c];
    const bottom = board[r + 1][c];
    if (top && bottom) {
      if (op === '<' && top >= bottom) {
        errors.add(`${r},${c}`); errors.add(`${r + 1},${c}`);
      }
      if (op === '>' && top <= bottom) {
        errors.add(`${r},${c}`); errors.add(`${r + 1},${c}`);
      }
    }
  }

  for (let r = 0; r < size; r++) {
    const rowVals = board[r].filter(v => v > 0);
    if (new Set(rowVals).size !== rowVals.length) {
      board[r].forEach((v, c) => { if (v > 0) errors.add(`${r},${c}`); });
    }
  }

  for (let c = 0; c < size; c++) {
    const colVals = board.map(row => row[c]).filter(v => v > 0);
    if (new Set(colVals).size !== colVals.length) {
      board.forEach((row, r) => { if (row[c] > 0) errors.add(`${r},${c}`); });
    }
  }

  return errors;
}

export function isSolved(board, solution, size) {
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] !== solution[r][c]) return false;
    }
  }
  return true;
}