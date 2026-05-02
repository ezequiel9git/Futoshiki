import { useState, useEffect, useCallback } from 'react';
import { generateGame, checkConstraints, isSolved } from './futoshiki';

const DIFFICULTY_LABELS = { easy: 'Fácil', medium: 'Medio', hard: 'Difícil' };

function useTimer(running) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);
  const reset = useCallback(() => setSeconds(0), []);
  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  return { display: fmt(seconds), reset, seconds };
}

export default function Game() {
  const [difficulty, setDifficulty] = useState('easy');
  const [game, setGame] = useState(() => generateGame('easy'));
  const [board, setBoard] = useState(() => generateGame('easy').puzzle.map(r => [...r]));
  const [selected, setSelected] = useState(null);
  const [errors, setErrors] = useState(new Set());
  const [solved, setSolved] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [timerRunning, setTimerRunning] = useState(true);
  const { display: timerDisplay, reset: resetTimer } = useTimer(timerRunning && !solved);

  const startNewGame = useCallback((diff = difficulty) => {
    const newGame = generateGame(diff);
    setGame(newGame);
    setBoard(newGame.puzzle.map(r => [...r]));
    setSelected(null);
    setErrors(new Set());
    setSolved(false);
    setMistakes(0);
    setTimerRunning(true);
    resetTimer();
  }, [difficulty, resetTimer]);

  const handleDifficulty = (diff) => {
    setDifficulty(diff);
    startNewGame(diff);
  };

  const handleCellClick = (r, c) => {
    if (solved) return;
    const key = `${r},${c}`;
    setSelected(prev => prev === key ? null : key);
  };

  const handleInput = useCallback((num) => {
    if (!selected || solved) return;
    const [r, c] = selected.split(',').map(Number);
    if (game.puzzle[r][c] !== 0) return;

    const newBoard = board.map(row => [...row]);
    newBoard[r][c] = num;

    if (num !== 0 && num !== game.solution[r][c]) {
      setMistakes(m => m + 1);
    }

    const newErrors = checkConstraints(newBoard, game.hConstraints, game.vConstraints, game.size);
    setErrors(newErrors);
    setBoard(newBoard);

    if (isSolved(newBoard, game.solution, game.size)) {
      setSolved(true);
      setTimerRunning(false);
    }
  }, [selected, solved, board, game]);

  useEffect(() => {
    const handleKey = (e) => {
      const n = parseInt(e.key);
      if (!isNaN(n) && n >= 0 && n <= game.size) handleInput(n);
      if (e.key === 'Backspace' || e.key === 'Delete') handleInput(0);
      if (e.key === 'Escape') setSelected(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleInput, game.size]);

  const { puzzle, hConstraints, vConstraints, size } = game;

  return (
    <div className="min-h-screen bg-[#0f0e17] text-white flex flex-col items-center justify-start py-8 px-4 font-mono">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-4xl font-bold tracking-widest text-[#ff8906] uppercase mb-1">
          Futoshiki
        </h1>
        <p className="text-[#a7a9be] text-sm tracking-widest uppercase">
          Puzzle de desigualdades
        </p>
      </div>

      {/* Difficulty selector */}
      <div className="flex gap-2 mb-6">
        {Object.entries(DIFFICULTY_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => handleDifficulty(key)}
            className={`px-4 py-1.5 rounded text-sm font-bold tracking-widest uppercase transition-all border ${
              difficulty === key
                ? 'bg-[#ff8906] text-[#0f0e17] border-[#ff8906]'
                : 'bg-transparent text-[#a7a9be] border-[#a7a9be] hover:border-[#ff8906] hover:text-[#ff8906]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Stats bar */}
      <div className="flex gap-8 mb-6 text-sm tracking-widest">
        <div className="text-center">
          <div className="text-[#a7a9be] uppercase text-xs mb-0.5">Tiempo</div>
          <div className="text-[#ff8906] font-bold text-lg">{timerDisplay}</div>
        </div>
        <div className="text-center">
          <div className="text-[#a7a9be] uppercase text-xs mb-0.5">Errores</div>
          <div className={`font-bold text-lg ${mistakes > 0 ? 'text-[#e53170]' : 'text-white'}`}>
            {mistakes}
          </div>
        </div>
      </div>

      {/* Board */}
      <div className="relative mb-6">
        <Board
          board={board}
          puzzle={puzzle}
          size={size}
          selected={selected}
          errors={errors}
          hConstraints={hConstraints}
          vConstraints={vConstraints}
          onCellClick={handleCellClick}
          solved={solved}
        />
      </div>

      {/* Number pad */}
      <NumberPad size={size} onInput={handleInput} />

      {/* Actions */}
      <div className="flex gap-3 mt-5">
        <button
          onClick={() => handleInput(0)}
          className="px-5 py-2 rounded border border-[#a7a9be] text-[#a7a9be] text-sm tracking-widest uppercase hover:border-white hover:text-white transition-all"
        >
          Borrar
        </button>
        <button
          onClick={() => startNewGame(difficulty)}
          className="px-5 py-2 rounded border border-[#ff8906] text-[#ff8906] text-sm tracking-widest uppercase hover:bg-[#ff8906] hover:text-[#0f0e17] transition-all font-bold"
        >
          Nuevo juego
        </button>
      </div>

      {/* Solved banner */}
      {solved && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-[#1a1a2e] border-2 border-[#ff8906] rounded-2xl p-10 text-center shadow-2xl">
            <div className="text-5xl mb-3">🎉</div>
            <h2 className="text-3xl font-bold text-[#ff8906] mb-2 tracking-widest uppercase">
              ¡Resuelto!
            </h2>
            <p className="text-[#a7a9be] mb-1">Tiempo: <span className="text-white font-bold">{timerDisplay}</span></p>
            <p className="text-[#a7a9be] mb-6">Errores: <span className={`font-bold ${mistakes > 0 ? 'text-[#e53170]' : 'text-[#2cb67d]'}`}>{mistakes}</span></p>
            <button
              onClick={() => startNewGame(difficulty)}
              className="px-8 py-3 bg-[#ff8906] text-[#0f0e17] font-bold rounded-lg tracking-widest uppercase hover:brightness-110 transition-all"
            >
              Jugar de nuevo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Board({ board, puzzle, size, selected, errors, hConstraints, vConstraints, onCellClick, solved }) {
  return (
    <div className="inline-block">
      {board.map((row, r) => (
        <div key={r}>
          {/* Row of cells + horizontal constraints */}
          <div className="flex items-center">
            {row.map((val, c) => {
              const key = `${r},${c}`;
              const isSelected = selected === key;
              const isError = errors.has(key);
              const isGiven = puzzle[r][c] !== 0;
              const isHighlighted = selected && !isSelected && (
                selected.split(',')[0] === String(r) ||
                selected.split(',')[1] === String(c)
              );
              const hKey = `${r},${c}`;
              const hOp = hConstraints[hKey];

              return (
                <div key={c} className="flex items-center">
                  {/* Cell */}
                  <div
                    onClick={() => onCellClick(r, c)}
                    className={`
                      w-12 h-12 flex items-center justify-center text-xl font-bold rounded cursor-pointer
                      border-2 transition-all select-none
                      ${isSelected
                        ? 'border-[#ff8906] bg-[#ff8906]/20 text-[#ff8906]'
                        : isError
                          ? 'border-[#e53170] bg-[#e53170]/10 text-[#e53170]'
                          : isHighlighted
                            ? 'border-[#a7a9be]/40 bg-white/5 text-white'
                            : 'border-[#2e2e4a] bg-[#1a1a2e] text-white hover:border-[#a7a9be]/60'
                      }
                      ${isGiven ? 'text-[#ff8906] opacity-90' : ''}
                      ${solved && !isError ? 'border-[#2cb67d]/40' : ''}
                    `}
                  >
                    {val !== 0 ? val : ''}
                  </div>

                  {/* Horizontal constraint */}
                  {c < size - 1 && (
                    <div className="w-7 text-center text-[#e53170] font-bold text-sm select-none">
                      {hOp || ''}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Vertical constraints row */}
          {r < size - 1 && (
            <div className="flex items-center">
              {row.map((_, c) => {
                const vKey = `${r},${c}`;
                const vOp = vConstraints[vKey];
                const hKey = `${r},${c}`;
                const hOp = hConstraints[hKey];

                return (
                  <div key={c} className="flex items-center">
                    <div className="w-12 h-6 flex items-center justify-center text-[#2cb67d] font-bold text-sm select-none">
                      {vOp
                        ? (vOp === '<' ? '∧' : '∨')
                        : ''}
                    </div>
                    {c < size - 1 && <div className="w-7" />}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function NumberPad({ size, onInput }) {
  return (
    <div className="flex gap-2">
      {[...Array(size)].map((_, i) => (
        <button
          key={i + 1}
          onClick={() => onInput(i + 1)}
          className="w-11 h-11 rounded-lg border-2 border-[#2e2e4a] bg-[#1a1a2e] text-white font-bold text-lg
            hover:border-[#ff8906] hover:text-[#ff8906] transition-all active:scale-95"
        >
          {i + 1}
        </button>
      ))}
    </div>
  );
}