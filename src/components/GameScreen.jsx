import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import Scoreboard from './Scoreboard';
import AnswerReveal from './AnswerReveal';
import Confetti from './Confetti';

const ROUND_PHASES = {
  QUESTION: 'question',
  ANSWERING: 'answering',
  REVEAL: 'reveal',
};

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function GameScreen({
  players,
  scores,
  questions,
  roundNumber,
  onUpdateScores,
  onNextRound,
  onBackToSetup,
}) {
  const [roundPhase, setRoundPhase] = useState(ROUND_PHASES.QUESTION);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [usedQuestions, setUsedQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [showScoreboard, setShowScoreboard] = useState(false);
  const inputRef = useRef(null);

  // Pick a question for each new round
  useEffect(() => {
    let available = questions.filter(q => !usedQuestions.includes(q));
    if (available.length === 0) {
      setUsedQuestions([]);
      available = [...questions];
    }
    const randomQ = available[Math.floor(Math.random() * available.length)];
    setCurrentQuestion(randomQ);
    setUsedQuestions(prev => [...prev, randomQ]);
    setAnswers({});
    setCurrentPlayerIndex(0);
    setRoundPhase(ROUND_PHASES.QUESTION);
  }, [roundNumber]);

  const handleShowQuestion = () => {
    setRoundPhase(ROUND_PHASES.ANSWERING);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSubmitAnswer = () => {
    const answer = currentAnswer.trim();
    if (!answer) return;

    const newAnswers = { ...answers, [players[currentPlayerIndex]]: answer };
    setAnswers(newAnswers);
    setCurrentAnswer('');

    if (currentPlayerIndex < players.length - 1) {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      // All answered => reveal
      const { majority, majorityPlayers } = findMajority(newAnswers);
      
      // Update scores
      if (majority && majorityPlayers.length > 0) {
        const newScores = { ...scores };
        majorityPlayers.forEach(name => {
          newScores[name] = (newScores[name] || 0) + 1;
        });
        onUpdateScores(newScores);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
      setRoundPhase(ROUND_PHASES.REVEAL);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmitAnswer();
  };

  const handleNextRound = () => {
    onNextRound();
  };

  return (
    <div className="min-h-screen flex flex-col">
      {showConfetti && <Confetti />}

      {/* Top bar */}
      <div className="glass-strong border-b border-white/5 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToSetup}
              className="w-9 h-9 rounded-xl bg-surface-700/60 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              title="بازگشت"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-black gradient-text leading-tight">تله‌پاتی</h1>
              <p className="text-[11px] text-slate-500">راند {roundNumber.toLocaleString('fa-IR')}</p>
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
        <div className="animate-slide-down">
          <Scoreboard players={players} scores={scores} compact />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-2xl mx-auto w-full">

        {/* Phase: Show question intro */}
        {roundPhase === ROUND_PHASES.QUESTION && (
          <div className="w-full text-center animate-scale-in">
            <div className="mb-6">
              <span className="inline-block px-4 py-1.5 rounded-full bg-neon-purple/10 border border-neon-purple/20 text-neon-purple text-sm font-medium mb-4">
                راند {roundNumber.toLocaleString('fa-IR')}
              </span>
            </div>

            <div className="glass rounded-3xl p-8 sm:p-10 neon-border mb-8">
              <p className="text-sm text-slate-400 mb-4">سوال این راند:</p>
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-relaxed">
                {currentQuestion}
              </h2>
            </div>

            <p className="text-slate-400 text-sm mb-6">
              هر بازیکن نوبتی جواب می‌دهد. بقیه نگاه نکنید! 🙈
            </p>

            <button
              onClick={handleShowQuestion}
              className="btn-press px-10 py-4 rounded-2xl bg-gradient-to-l from-neon-purple to-neon-blue text-white font-bold text-lg hover:shadow-xl hover:shadow-neon-purple/30 hover:-translate-y-0.5 transition-all duration-300"
            >
              شروع پاسخ‌دهی
            </button>
          </div>
        )}

        {/* Phase: Players answering one by one */}
        {roundPhase === ROUND_PHASES.ANSWERING && (
          <div className="w-full animate-scale-in" key={currentPlayerIndex}>
            {/* Progress bar */}
            <div className="w-full h-1.5 bg-surface-700 rounded-full mb-8 overflow-hidden">
              <div
                className="h-full bg-gradient-to-l from-neon-purple to-neon-blue rounded-full transition-all duration-500 ease-out"
                style={{ width: `${((currentPlayerIndex + 1) / players.length) * 100}%` }}
              />
            </div>

            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 mb-3">
                <span className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center font-bold text-white text-sm">
                  {currentPlayerIndex + 1}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  {players[currentPlayerIndex]}
                </h2>
              </div>
              <p className="text-slate-400 text-sm">
                نوبت توئه! فقط تو نگاه کن 👀
              </p>
            </div>

            {/* Question reminder */}
            <div className="glass rounded-2xl p-5 mb-6 neon-border-blue">
              <p className="text-white text-lg font-bold text-center leading-relaxed">
                {currentQuestion}
              </p>
            </div>

            {/* Answer input */}
            <div className="flex gap-2">
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
                onClick={handleSubmitAnswer}
                disabled={!currentAnswer.trim()}
                className="btn-press px-6 py-4 rounded-xl bg-gradient-to-l from-neon-purple to-neon-blue text-white font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-neon-purple/30 transition-all"
              >
                ثبت ✓
              </button>
            </div>

            {/* Pass device instruction */}
            <div className="mt-6 text-center">
              <p className="text-xs text-slate-500">
                بعد از ثبت، دستگاه رو بده به بازیکن بعدی
              </p>
              <div className="flex justify-center gap-1.5 mt-3">
                {players.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      i < currentPlayerIndex ? 'bg-neon-purple' :
                      i === currentPlayerIndex ? 'bg-neon-blue scale-125' :
                      'bg-surface-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Phase: Reveal answers */}
        {roundPhase === ROUND_PHASES.REVEAL && (
          <div className="w-full animate-scale-in">
            <AnswerReveal
              question={currentQuestion}
              answers={answers}
              players={players}
              scores={scores}
              roundNumber={roundNumber}
            />

            <button
              onClick={handleNextRound}
              className="btn-press w-full mt-8 py-4 rounded-2xl bg-gradient-to-l from-neon-purple via-neon-blue to-neon-cyan text-white font-black text-xl hover:shadow-xl hover:shadow-neon-purple/30 hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group"
            >
              <span className="relative z-10">راند بعدی ⚡</span>
              <div className="absolute inset-0 bg-gradient-to-l from-neon-pink via-neon-purple to-neon-blue opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </div>
        )}
      </div>

      {/* Bottom scoreboard (always visible mini) */}
      <div className="glass-strong border-t border-white/5 py-3 px-4 sticky bottom-0 z-20">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
            {getSortedPlayers(players, scores).map(({ name, score }, i) => (
              <div
                key={name}
                className={`flex items-center gap-2 flex-shrink-0 px-3 py-1.5 rounded-full transition-all ${
                  i === 0 && score > 0
                    ? 'bg-neon-purple/15 border border-neon-purple/30'
                    : 'bg-surface-700/40 border border-white/5'
                }`}
              >
                {i === 0 && score > 0 && <span className="text-xs">👑</span>}
                <span className="text-xs text-slate-300 font-medium whitespace-nowrap">{name}</span>
                <span className={`text-xs font-bold ${i === 0 && score > 0 ? 'text-neon-purple' : 'text-slate-500'}`}>
                  {score.toLocaleString('fa-IR')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function findMajority(answers) {
  const freq = {};
  const normalized = {};
  
  Object.entries(answers).forEach(([player, answer]) => {
    const norm = answer.trim().toLowerCase().replace(/\s+/g, ' ');
    normalized[player] = norm;
    freq[norm] = (freq[norm] || 0) + 1;
  });

  const maxCount = Math.max(...Object.values(freq));
  
  // Must be > 1 to count as majority
  if (maxCount < 2) return { majority: null, majorityPlayers: [] };

  // Find most common answer(s)
  const topAnswers = Object.keys(freq).filter(a => freq[a] === maxCount);
  
  // If there's a tie for most common, we pick the first one alphabetically (or we could skip)
  // Standard herd mentality: if there's a tie, nobody scores.
  if (topAnswers.length > 1) {
    return { majority: null, majorityPlayers: [] };
  }

  const majority = topAnswers[0];
  const majorityPlayers = Object.entries(normalized)
    .filter(([_, norm]) => norm === majority)
    .map(([player]) => player);

  return { majority, majorityPlayers };
}

function getSortedPlayers(players, scores) {
  return [...players]
    .map(name => ({ name, score: scores[name] || 0 }))
    .sort((a, b) => b.score - a.score);
}
