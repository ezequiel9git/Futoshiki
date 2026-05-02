import { useState, useEffect, useCallback } from 'react';
import { generateGame, checkConstraints, isSolved } from './futoshiki';

const DIFFICULTY_LABELS = { easy: 'Fácil', medium: 'Medio', hard: 'Difícil' };
const DIFFICULTY_DESC   = { easy: '4 × 4', medium: '5 × 5', hard: '6 × 6' };

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
  const [difficulty, setDifficulty]   = useState('easy');
  const [game, setGame]               = useState(null);
  const [board, setBoard]             = useState(null);
  const [selected, setSelected]       = useState(null);
  const [errors, setErrors]           = useState(new Set());
  const [solved, setSolved]           = useState(false);
  const [mistakes, setMistakes]       = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [hintsUsed, setHintsUsed]     = useState(0);
  const [showVictory, setShowVictory] = useState(false);

  const { display: timerDisplay, reset: resetTimer, seconds } = useTimer(timerRunning && !solved);

  const startNewGame = useCallback((diff) => {
    const d = diff || difficulty;
    const newGame = generateGame(d);
    setGame(newGame);
    setBoard(newGame.puzzle.map(r => [...r]));
    setSelected(null);
    setErrors(new Set());
    setSolved(false);
    setMistakes(0);
    setHintsUsed(0);
    setShowVictory(false);
    setTimerRunning(true);
    resetTimer();
  }, [difficulty, resetTimer]);

  useEffect(() => { startNewGame('easy'); }, []);

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
    if (!selected || solved || !game) return;
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
      setTimeout(() => setShowVictory(true), 500);
    }
  }, [selected, solved, board, game]);

  const handleHint = useCallback(() => {
    if (!game || solved) return;
    const empties = [];
    for (let r = 0; r < game.size; r++)
      for (let c = 0; c < game.size; c++)
        if (board[r][c] === 0) empties.push([r, c]);
    if (empties.length === 0) return;
    const [r, c] = empties[Math.floor(Math.random() * empties.length)];
    const newBoard = board.map(row => [...row]);
    newBoard[r][c] = game.solution[r][c];
    const newErrors = checkConstraints(newBoard, game.hConstraints, game.vConstraints, game.size);
    setErrors(newErrors);
    setBoard(newBoard);
    setHintsUsed(h => h + 1);
    setSelected(`${r},${c}`);
    if (isSolved(newBoard, game.solution, game.size)) {
      setSolved(true);
      setTimerRunning(false);
      setTimeout(() => setShowVictory(true), 500);
    }
  }, [game, board, solved]);

  useEffect(() => {
    const handleKey = (e) => {
      if (!game) return;
      const n = parseInt(e.key);
      if (!isNaN(n) && n >= 0 && n <= game.size) handleInput(n);
      if (e.key === 'Backspace' || e.key === 'Delete') handleInput(0);
      if (e.key === 'Escape') setSelected(null);
      if (e.key === 'h' || e.key === 'H') handleHint();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleInput, handleHint, game]);

  if (!game || !board) return null;

  const { puzzle, hConstraints, vConstraints, size } = game;

  return (
    <>
      {/* Animated gradient background */}
      <div className="bg-mesh" />

      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '36px', paddingBottom: '48px' }}>

        {/* Logo / Title */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginBottom: '6px' }}>
            <div style={{ width: '36px', height: '1px', background: 'linear-gradient(90deg, transparent, var(--gold))' }} />
            <span style={{ fontSize: '0.6rem', letterSpacing: '0.35em', color: 'var(--gold)', textTransform: 'uppercase', fontFamily: 'Cinzel, serif' }}>Creado por Ezequiel</span>
            <div style={{ width: '36px', height: '1px', background: 'linear-gradient(90deg, var(--gold), transparent)' }} />
          </div>
          <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: '3.2rem', fontWeight: 900, letterSpacing: '0.18em', margin: 0, lineHeight: 1,
            background: 'linear-gradient(135deg, #c9a84c 0%, #e8c97a 40%, #c9a84c 70%, #a07830 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            FUTOSHIKI
          </h1>
          <div className="gold-line" style={{ marginTop: '10px', maxWidth: '280px', margin: '10px auto 0' }} />
          <p style={{ fontFamily: 'Crimson Pro, serif', fontStyle: 'italic', color: 'var(--muted)', fontSize: '0.88rem', marginTop: '8px', letterSpacing: '0.08em' }}>
            Puzzle de desigualdades japonés
          </p>
        </div>

        {/* Difficulty pills */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {Object.entries(DIFFICULTY_LABELS).map(([key, label]) => (
            <button key={key} className={`pill${difficulty === key ? ' active' : ''}`} onClick={() => handleDifficulty(key)}>
              {label} <span style={{ opacity: 0.6, fontSize: '0.6rem' }}>{DIFFICULTY_DESC[key]}</span>
            </button>
          ))}
        </div>

        {/* Stat row */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <div className="stat-card">
            <div style={{ fontSize: '0.55rem', letterSpacing: '0.18em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Tiempo</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--gold-lt)', letterSpacing: '0.05em' }}>{timerDisplay}</div>
          </div>
          <div className="stat-card">
            <div style={{ fontSize: '0.55rem', letterSpacing: '0.18em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Errores</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: mistakes > 0 ? 'var(--danger)' : '#e8e6f0', letterSpacing: '0.05em' }}>{mistakes}</div>
          </div>
          <div className="stat-card">
            <div style={{ fontSize: '0.55rem', letterSpacing: '0.18em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Pistas</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: hintsUsed > 0 ? 'var(--gold)' : '#e8e6f0', letterSpacing: '0.05em' }}>{hintsUsed}</div>
          </div>
        </div>

        {/* Board */}
        <div style={{ marginBottom: '24px', padding: '20px', background: 'rgba(10,10,20,0.5)', borderRadius: '16px', border: '1px solid var(--rim)', boxShadow: '0 8px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)' }}>
          <Board
            board={board} puzzle={puzzle} size={size} selected={selected}
            errors={errors} hConstraints={hConstraints} vConstraints={vConstraints}
            onCellClick={handleCellClick} solved={solved}
          />
        </div>

        {/* Number pad */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {[...Array(size)].map((_, i) => (
            <button key={i + 1} className="num-btn" onClick={() => handleInput(i + 1)}>{i + 1}</button>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button className="btn-ghost" onClick={() => handleInput(0)}>✕ Borrar</button>
          <button className="btn-ghost" onClick={handleHint} style={{ color: 'var(--gold)', borderColor: 'rgba(201,168,76,0.4)' }}>
            ◆ Pista
          </button>
          <button className="btn-primary" onClick={() => startNewGame(difficulty)}>↻ Nuevo juego</button>
        </div>

        {/* Legend */}
        <div style={{ marginTop: '28px', display: 'flex', gap: '20px', opacity: 0.55 }}>
          <span style={{ fontSize: '0.62rem', letterSpacing: '0.1em', color: 'var(--ember)', fontFamily: 'Crimson Pro, serif', fontStyle: 'italic' }}>
            &lt; &gt; restricción horizontal
          </span>
          <span style={{ fontSize: '0.62rem', letterSpacing: '0.1em', color: 'var(--success)', fontFamily: 'Crimson Pro, serif', fontStyle: 'italic' }}>
            ∧ ∨ restricción vertical
          </span>
        </div>
      </div>

      {/* Victory modal */}
      {showVictory && (
        <div className="modal-overlay" onClick={() => setShowVictory(false)}>
          <div className="modal-box rise-in" onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '3rem', marginBottom: '8px' }}>✦</div>
            <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '2rem', fontWeight: 900, letterSpacing: '0.15em',
              background: 'linear-gradient(135deg, #c9a84c, #e8c97a, #c9a84c)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 6px' }}>
              RESUELTO
            </h2>
            <div className="gold-line" style={{ marginBottom: '24px' }} />

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '28px' }}>
              <div style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: '10px', padding: '12px 20px', minWidth: '80px' }}>
                <div style={{ fontSize: '0.55rem', letterSpacing: '0.18em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Tiempo</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--gold-lt)' }}>{timerDisplay}</div>
              </div>
              <div style={{ background: 'rgba(229,49,112,0.08)', border: '1px solid rgba(229,49,112,0.2)', borderRadius: '10px', padding: '12px 20px', minWidth: '80px' }}>
                <div style={{ fontSize: '0.55rem', letterSpacing: '0.18em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Errores</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: mistakes === 0 ? 'var(--success)' : 'var(--danger)' }}>{mistakes}</div>
              </div>
              <div style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '10px', padding: '12px 20px', minWidth: '80px' }}>
                <div style={{ fontSize: '0.55rem', letterSpacing: '0.18em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Pistas</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: hintsUsed === 0 ? 'var(--success)' : 'var(--gold)' }}>{hintsUsed}</div>
              </div>
            </div>

            {mistakes === 0 && hintsUsed === 0 && (
              <p style={{ fontFamily: 'Crimson Pro, serif', fontStyle: 'italic', color: 'var(--gold)', fontSize: '0.9rem', marginBottom: '20px', opacity: 0.9 }}>
                ✦ Solución perfecta — sin errores ni pistas ✦
              </p>
            )}

            <button className="btn-primary" style={{ padding: '12px 36px', fontSize: '0.78rem' }} onClick={() => startNewGame(difficulty)}>
              ↻ Jugar de nuevo
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function Board({ board, puzzle, size, selected, errors, hConstraints, vConstraints, onCellClick, solved }) {
  const selRow = selected ? parseInt(selected.split(',')[0]) : -1;
  const selCol = selected ? parseInt(selected.split(',')[1]) : -1;

  return (
    <div>
      {board.map((row, r) => (
        <div key={r}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {row.map((val, c) => {
              const key = `${r},${c}`;
              const isSelected   = selected === key;
              const isError      = errors.has(key);
              const isGiven      = puzzle[r][c] !== 0;
              const isHighlighted = !isSelected && (r === selRow || c === selCol);
              const hOp = hConstraints[`${r},${c}`];

              let cls = 'cell';
              if (isSelected)    cls += ' selected';
              else if (isError)  cls += ' error';
              else if (isHighlighted) cls += ' highlighted';
              if (isGiven)       cls += ' given';
              if (solved && !isError) cls += ' solved-ok';

              return (
                <div key={c} style={{ display: 'flex', alignItems: 'center' }}>
                  <div className={cls} onClick={() => onCellClick(r, c)}>
                    {val !== 0 ? val : ''}
                  </div>
                  {c < size - 1 && (
                    <div className="h-constraint">{hOp || ''}</div>
                  )}
                </div>
              );
            })}
          </div>

          {r < size - 1 && (
            <div style={{ display: 'flex' }}>
              {row.map((_, c) => (
                <div key={c} style={{ display: 'flex', alignItems: 'center' }}>
                  <div className="v-constraint" style={{ width: '52px' }}>
                    {vConstraints[`${r},${c}`]
                      ? (vConstraints[`${r},${c}`] === '<' ? '∧' : '∨')
                      : ''}
                  </div>
                  {c < size - 1 && <div style={{ width: '28px' }} />}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}