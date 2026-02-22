import { useState, useRef, useEffect } from 'react';
import MultiplayerReveal from './MultiplayerReveal';
import Confetti from './Confetti';

export default function MultiplayerGame({ multiplayer }) {
  const {
    gameState, isHost, playerId, playersList, myAnswer,
    allAnswered, answeredCount, totalPlayers,
    submitAnswer, revealAnswers, startRound, nextRound, leaveRoom, error,
  } = multiplayer;

  const [currentAnswer, setCurrentAnswer] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [prevPhase, setPrevPhase] = useState(null);
  const inputRef = useRef(null);

  const phase = gameState?.phase;
  const round = gameState?.round || 0;
  const question = gameState?.currentQuestion || '';
  const answers = gameState?.answers || {};

  // Auto-reveal when all answered (host only)
  useEffect(() => {
    if (isHost && phase === 'answering' && allAnswered && totalPlayers >= 3) {
      const timer = setTimeout(() => {
        revealAnswers();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isHost, phase, allAnswered, totalPlayers, revealAnswers]);

  // Show confetti on reveal
  useEffect(() => {
    if (phase === 'reveal' && prevPhase === 'answering') {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
    setPrevPhase(phase);
  }, [phase]);

  // Reset answer when new round
  useEffect(() => {
    if (phase === 'answering') {
      setCurrentAnswer('');
    }
  }, [round]);

  // Focus input
  useEffect(() => {
    if (phase === 'answering' && !myAnswer) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [phase, myAnswer]);

  const handleSubmit = () => {
    const trimmed = currentAnswer.trim();
    if (!trimmed) return;
    submitAnswer(trimmed);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const handleNextRound = () => {
    if (isHost) startRound();
  };

  const fa = (n) => n.toLocaleString('fa-IR');

  const sortedPlayers = [...playersList].sort((a, b) => b.score - a.score);
  const maxScore = Math.max(...sortedPlayers.map(p => p.score), 1);

  return (
    <div className="min-h-screen flex flex-col">
      {showConfetti && <Confetti />}

      {/* Top bar */}
      <div className="glass-strong border-b border-white/5 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={leaveRoom}
              className="w-9 h-9 rounded-xl bg-surface-700/60 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-black gradient-text leading-tight">تله‌پاتی</h1>
              <p className="text-[11px] text-slate-500">راند {fa(round)} • {fa(totalPlayers)} نفر</p>
            </div>
          </div>

          <button
            onClick={() => setShowScoreboard(!showScoreboard)}
            className="btn-press flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-700/60 border border-white/5 hover:border-neon-purple/30 transition-all"
          >
            <span className="text-base">🏆</span>
            <span className="text-sm text-white font-medium">امتیازات</span>
          </button>
        </div>
      </div>

      {/* Scoreboard dropdown */}
      {showScoreboard && (
        <div className="glass-strong border-b border-white/5 py-4 px-4 animate-slide-down">
          <div className="max-w-2xl mx-auto space-y-2">
            {sortedPlayers.map(({ name, score, id, isHost: ih }, i) => (
              <div key={id} className="flex items-center gap-3">
                <span className={`w-6 text-center text-sm font-bold ${
                  i === 0 && score > 0 ? 'text-yellow-400' :
                  i === 1 && score > 0 ? 'text-slate-300' :
                  i === 2 && score > 0 ? 'text-amber-600' : 'text-slate-600'
                }`}>
                  {i === 0 && score > 0 ? '🥇' : i === 1 && score > 0 ? '🥈' : i === 2 && score > 0 ? '🥉' : fa(i + 1)}
                </span>
                <span className="text-sm text-white font-medium flex-1">
                  {name} {id === playerId ? '(تو)' : ''} {ih ? '👑' : ''}
                </span>
                <div className="w-24 h-1.5 bg-surface-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-l from-neon-purple to-neon-blue rounded-full transition-all duration-500"
                    style={{ width: `${(score / maxScore) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-neon-purple w-8 text-left">{fa(score)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-2xl mx-auto w-full">

        {/* Phase: Answering */}
        {phase === 'answering' && (
          <div className="w-full animate-scale-in">
            {/* Question */}
            <div className="text-center mb-2">
              <span className="inline-block px-4 py-1.5 rounded-full bg-neon-purple/10 border border-neon-purple/20 text-neon-purple text-sm font-medium mb-4">
                راند {fa(round)}
              </span>
            </div>

            <div className="glass rounded-2xl p-6 sm:p-8 neon-border mb-6">
              <h2 className="text-xl sm:text-2xl font-black text-white text-center leading-relaxed">
                {question}
              </h2>
            </div>

            {/* Answer input or waiting */}
            {!myAnswer ? (
              <div>
                <div className="flex gap-2 mb-4">
                  <input
                    ref={inputRef}
                    type="text"
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="جوابت رو بنویس..."
                    className="flex-1 bg-surface-800/80 text-white rounded-xl px-5 py-4 border border-white/5 focus:border-neon-purple/50 transition-colors text-lg"
                    maxLength={50}
                    autoComplete="off"
                  />
                  <button
                    onClick={handleSubmit}
                    disabled={!currentAnswer.trim()}
                    className="btn-press px-6 py-4 rounded-xl bg-gradient-to-l from-neon-purple to-neon-blue text-white font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-neon-purple/30 transition-all"
                  >
                    ثبت ✓
                  </button>
                </div>
              </div>
            ) : (
              <div className="glass rounded-2xl p-5 text-center mb-4 neon-border-blue animate-scale-in">
                <p className="text-sm text-slate-400 mb-1">جواب تو:</p>
                <p className="text-xl font-bold text-white">{myAnswer}</p>
                <p className="text-xs text-green-400 mt-2">✓ ثبت شد</p>
              </div>
            )}

            {/* Waiting status */}
            <div className="glass rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                {!allAnswered && <span className="w-4 h-4 border-2 border-slate-600 border-t-neon-purple rounded-full animate-spin" />}
                <p className="text-sm text-slate-400">
                  {allAnswered ? 'همه جواب دادن! 🎉' : `${fa(answeredCount)} از ${fa(totalPlayers)} نفر جواب دادن...`}
                </p>
              </div>

              {/* Player answer indicators */}
              <div className="flex flex-wrap justify-center gap-2">
                {playersList.map(p => {
                  const answered = !!answers[p.id];
                  return (
                    <span
                      key={p.id}
                      className={`text-xs px-2.5 py-1 rounded-full transition-all duration-300 ${
                        answered
                          ? 'bg-neon-purple/15 border border-neon-purple/30 text-neon-purple'
                          : 'bg-surface-700/40 border border-white/5 text-slate-500'
                      }`}
                    >
                      {answered ? '✓' : '⏳'} {p.name}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Phase: Reveal */}
        {phase === 'reveal' && (
          <div className="w-full animate-scale-in">
            <MultiplayerReveal
              question={question}
              answers={answers}
              playersList={playersList}
              round={round}
              playerId={playerId}
            />

            {isHost && (
              <button
                onClick={handleNextRound}
                className="btn-press w-full mt-8 py-4 rounded-2xl bg-gradient-to-l from-neon-purple via-neon-blue to-neon-cyan text-white font-black text-xl hover:shadow-xl hover:shadow-neon-purple/30 hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group"
              >
                <span className="relative z-10">راند بعدی ⚡</span>
                <div className="absolute inset-0 bg-gradient-to-l from-neon-pink via-neon-purple to-neon-blue opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            )}

            {!isHost && (
              <div className="mt-8 text-center">
                <div className="inline-flex items-center gap-2 text-slate-400">
                  <span className="w-4 h-4 border-2 border-slate-600 border-t-neon-purple rounded-full animate-spin" />
                  <span className="text-sm">منتظر راند بعدی...</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Phase: Waiting (between rounds) */}
        {phase === 'waiting' && (
          <div className="w-full text-center animate-scale-in">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-slate-400">
              {isHost ? 'آماده‌ای؟' : 'منتظر میزبان...'}
            </p>
            {isHost && (
              <button
                onClick={() => startRound()}
                className="btn-press mt-6 px-10 py-4 rounded-2xl bg-gradient-to-l from-neon-purple to-neon-blue text-white font-bold text-lg hover:shadow-xl hover:shadow-neon-purple/30 transition-all"
              >
                شروع راند بعدی ⚡
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bottom scoreboard */}
      <div className="glass-strong border-t border-white/5 py-3 px-4 sticky bottom-0 z-20">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            {sortedPlayers.map(({ name, score, id }, i) => (
              <div
                key={id}
                className={`flex items-center gap-2 flex-shrink-0 px-3 py-1.5 rounded-full transition-all ${
                  i === 0 && score > 0
                    ? 'bg-neon-purple/15 border border-neon-purple/30'
                    : id === playerId
                    ? 'bg-neon-blue/10 border border-neon-blue/20'
                    : 'bg-surface-700/40 border border-white/5'
                }`}
              >
                {i === 0 && score > 0 && <span className="text-xs">👑</span>}
                <span className="text-xs text-slate-300 font-medium whitespace-nowrap">
                  {name}{id === playerId ? ' (تو)' : ''}
                </span>
                <span className={`text-xs font-bold ${i === 0 && score > 0 ? 'text-neon-purple' : 'text-slate-500'}`}>
                  {fa(score)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Error toast */}
      {error && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
          <div className="bg-red-500/20 border border-red-500/30 text-red-300 text-sm px-4 py-2 rounded-xl backdrop-blur-sm">
            {error}
          </div>
        </div>
      )}
    </div>
  );
}
