import { useState, useRef, useEffect } from 'react';
import defaultQuestions from '../data/questions';

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 10;

export default function SetupScreen({ onStart }) {
  const [players, setPlayers] = useState(['', '', '']);
  const [currentInput, setCurrentInput] = useState('');
  const [showQuestionEditor, setShowQuestionEditor] = useState(false);
  const [questions, setQuestions] = useState([...defaultQuestions]);
  const [newQuestion, setNewQuestion] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const questionInputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  const addPlayer = () => {
    const name = currentInput.trim();
    if (!name) return;
    if (players.filter(p => p).some(p => p === name)) {
      setError('این اسم قبلاً اضافه شده!');
      return;
    }
    if (players.filter(p => p).length >= MAX_PLAYERS) {
      setError(`حداکثر ${MAX_PLAYERS} بازیکن!`);
      return;
    }
    setError('');

    const emptyIndex = players.findIndex(p => !p);
    if (emptyIndex !== -1) {
      const updated = [...players];
      updated[emptyIndex] = name;
      setPlayers(updated);
    } else {
      setPlayers([...players, name]);
    }
    setCurrentInput('');
    inputRef.current?.focus();
  };

  const removePlayer = (index) => {
    const updated = players.filter((_, i) => i !== index);
    if (updated.length < MIN_PLAYERS) {
      const padded = [...updated];
      while (padded.length < MIN_PLAYERS) padded.push('');
      setPlayers(padded);
    } else {
      setPlayers(updated);
    }
  };

  const filledPlayers = players.filter(p => p);

  const handleStart = () => {
    if (filledPlayers.length < MIN_PLAYERS) {
      setError(`حداقل ${MIN_PLAYERS} بازیکن لازم است!`);
      return;
    }
    if (questions.length === 0) {
      setError('حداقل یک سوال لازم است!');
      return;
    }
    onStart(filledPlayers, questions);
  };

  const addQuestion = () => {
    const q = newQuestion.trim();
    if (!q) return;
    if (questions.includes(q)) return;
    setQuestions([q, ...questions]);
    setNewQuestion('');
    questionInputRef.current?.focus();
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') addPlayer();
  };

  const handleQuestionKeyDown = (e) => {
    if (e.key === 'Enter') addQuestion();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      {/* Logo / Title */}
      <div className="text-center mb-10 animate-fade-in">
        <div className="inline-block mb-4">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-neon-purple via-neon-blue to-neon-cyan flex items-center justify-center text-4xl shadow-lg shadow-neon-purple/30 rotate-3 hover:rotate-0 transition-transform duration-500">
            🧠
          </div>
        </div>
        <h1 className="text-5xl sm:text-6xl font-black gradient-text mb-3 tracking-tight">
          تله‌پاتی
        </h1>
        <p className="text-lg text-slate-400 font-light">
          ذهنت رو بخون • اکثریت برنده‌ست
        </p>
        <p className="text-sm text-slate-500 mt-2">
         ساخته شده توسط ممد درویشی 
        </p>
      </div>

      {/* Main card */}
      <div className="w-full max-w-lg animate-slide-up">
        <div className="glass-strong rounded-3xl p-6 sm:p-8">
          {/* Players section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-2xl">👥</span>
                بازیکنان
              </h2>
              <span className="text-sm text-slate-400 font-light">
                {filledPlayers.length}/{MAX_PLAYERS}
              </span>
            </div>

            {/* Input row */}
            <div className="flex gap-2 mb-4">
              <input
                ref={inputRef}
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="اسم بازیکن را وارد کنید..."
                className="flex-1 bg-surface-800/80 text-white rounded-xl px-4 py-3 border border-white/5 focus:border-neon-purple/50 transition-colors text-base"
                maxLength={20}
              />
              <button
                onClick={addPlayer}
                disabled={!currentInput.trim() || filledPlayers.length >= MAX_PLAYERS}
                className="btn-press px-5 py-3 rounded-xl bg-gradient-to-l from-neon-purple to-neon-blue text-white font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-neon-purple/30 transition-all duration-200"
              >
                افزودن
              </button>
            </div>

            {/* Error */}
            {error && (
              <p className="text-neon-pink text-sm mb-3 animate-scale-in">{error}</p>
            )}

            {/* Player chips */}
            <div className="flex flex-wrap gap-2">
              {players.map((name, i) => (
                name ? (
                  <div
                    key={i}
                    className="group flex items-center gap-2 bg-surface-700/60 rounded-full px-4 py-2 border border-white/5 animate-scale-in hover:border-neon-purple/30 transition-all"
                  >
                    <span className="w-6 h-6 rounded-full bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-sm text-white font-medium">{name}</span>
                    <button
                      onClick={() => removePlayer(i)}
                      className="w-5 h-5 rounded-full bg-white/5 text-slate-500 hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center text-xs transition-all opacity-0 group-hover:opacity-100"
                    >
                      ✕
                    </button>
                  </div>
                ) : null
              ))}
            </div>

            {filledPlayers.length < MIN_PLAYERS && (
              <p className="text-xs text-slate-500 mt-3">
                {MIN_PLAYERS - filledPlayers.length} بازیکن دیگر نیاز است
              </p>
            )}
          </div>

          {/* Question bank toggle */}
          <div className="border-t border-white/5 pt-5">
            <button
              onClick={() => setShowQuestionEditor(!showQuestionEditor)}
              className="w-full flex items-center justify-between text-slate-300 hover:text-white transition-colors py-2"
            >
              <span className="flex items-center gap-2 text-base font-medium">
                <span className="text-xl">📝</span>
                بانک سوالات
                <span className="text-xs text-slate-500 font-light">({questions.length} سوال)</span>
              </span>
              <svg
                className={`w-4 h-4 transition-transform duration-300 ${showQuestionEditor ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showQuestionEditor && (
              <div className="mt-4 animate-slide-down">
                <div className="flex gap-2 mb-3">
                  <input
                    ref={questionInputRef}
                    type="text"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    onKeyDown={handleQuestionKeyDown}
                    placeholder="سوال جدید اضافه کنید..."
                    className="flex-1 bg-surface-800/80 text-white rounded-xl px-4 py-2.5 border border-white/5 focus:border-neon-blue/50 transition-colors text-sm"
                  />
                  <button
                    onClick={addQuestion}
                    disabled={!newQuestion.trim()}
                    className="btn-press px-4 py-2.5 rounded-xl bg-neon-blue/20 text-neon-blue border border-neon-blue/30 font-bold text-sm disabled:opacity-30 hover:bg-neon-blue/30 transition-all"
                  >
                    +
                  </button>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                  {questions.map((q, i) => (
                    <div
                      key={i}
                      className="group flex items-center justify-between bg-surface-800/40 rounded-lg px-3 py-2 text-sm hover:bg-surface-700/40 transition-colors"
                    >
                      <span className="text-slate-300 truncate ml-2">{q}</span>
                      <button
                        onClick={() => removeQuestion(i)}
                        className="flex-shrink-0 w-5 h-5 rounded bg-white/5 text-slate-500 hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center text-[10px] transition-all opacity-0 group-hover:opacity-100"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Start button */}
        <button
          onClick={handleStart}
          disabled={filledPlayers.length < MIN_PLAYERS}
          className="btn-press w-full mt-6 py-4 rounded-2xl bg-gradient-to-l from-neon-purple via-neon-blue to-neon-cyan text-white font-black text-xl disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-xl hover:shadow-neon-purple/30 hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group"
        >
          <span className="relative z-10">شروع بازی 🎮</span>
          <div className="absolute inset-0 bg-gradient-to-l from-neon-pink via-neon-purple to-neon-blue opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
      </div>
    </div>
  );
}
