import { useState } from 'react';

export default function LobbyScreen({ multiplayer }) {
  const { roomCode, isHost, playersList, gameState, startRound, leaveRoom, error } = multiplayer;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = roomCode;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const canStart = playersList.length >= 3;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md animate-slide-up">
        {/* Room code display */}
        <div className="text-center mb-8">
          <p className="text-sm text-slate-400 mb-2">کد اتاق</p>
          <button
            onClick={handleCopy}
            className="btn-press inline-flex items-center gap-3 px-8 py-4 rounded-2xl glass neon-border hover:shadow-lg hover:shadow-neon-purple/20 transition-all group"
          >
            <span className="text-4xl sm:text-5xl font-black text-white tracking-[0.3em] font-mono" dir="ltr">
              {roomCode}
            </span>
            <span className="text-slate-400 group-hover:text-neon-purple transition-colors">
              {copied ? (
                <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </span>
          </button>
          <p className="text-xs text-slate-500 mt-2">
            {copied ? 'کپی شد! ✓' : 'برای کپی کلیک کنید'}
          </p>
        </div>

        {/* Share instruction */}
        <div className="glass rounded-2xl p-4 mb-6 text-center">
          <p className="text-slate-300 text-sm leading-relaxed">
            این کد رو به دوستات بده تا وارد بازی بشن 📲
            <br />
            <span className="text-slate-500 text-xs">هر کسی از گوشی خودش بازی می‌کنه</span>
          </p>
        </div>

        {/* Players list */}
        <div className="glass-strong rounded-3xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-xl">👥</span>
              بازیکنان
            </h2>
            <span className="text-sm text-slate-400">
              {playersList.length}/۱۰
            </span>
          </div>

          <div className="space-y-2">
            {playersList.map((player, i) => (
              <div
                key={player.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-surface-800/40 border border-white/5 animate-scale-in"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <span className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                  {i + 1}
                </span>
                <span className="text-white font-medium flex-1">{player.name}</span>
                {player.isHost && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-neon-purple/15 border border-neon-purple/30 text-neon-purple font-medium">
                    میزبان 👑
                  </span>
                )}
              </div>
            ))}
          </div>

          {playersList.length < 3 && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 text-slate-500 text-sm">
                <span className="w-4 h-4 border-2 border-slate-600 border-t-slate-400 rounded-full animate-spin" />
                منتظر بازیکنان دیگر... ({3 - playersList.length} نفر دیگه نیاز هست)
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <p className="text-neon-pink text-sm mb-4 text-center animate-scale-in">{error}</p>
        )}

        {/* Actions */}
        {isHost ? (
          <button
            onClick={startRound}
            disabled={!canStart}
            className="btn-press w-full py-4 rounded-2xl bg-gradient-to-l from-neon-purple via-neon-blue to-neon-cyan text-white font-black text-xl disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-xl hover:shadow-neon-purple/30 hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group"
          >
            <span className="relative z-10">
              {canStart ? 'شروع بازی ⚡' : `حداقل ۳ بازیکن لازمه`}
            </span>
            {canStart && <div className="absolute inset-0 bg-gradient-to-l from-neon-pink via-neon-purple to-neon-blue opacity-0 group-hover:opacity-100 transition-opacity duration-300" />}
          </button>
        ) : (
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-2 text-slate-400">
              <span className="w-4 h-4 border-2 border-slate-600 border-t-neon-purple rounded-full animate-spin" />
              <span className="text-sm">منتظر شروع بازی توسط میزبان...</span>
            </div>
          </div>
        )}

        <button
          onClick={leaveRoom}
          className="w-full mt-3 py-2 text-slate-500 text-sm hover:text-red-400 transition-colors"
        >
          {isHost ? 'بستن اتاق' : 'خروج از اتاق'}
        </button>
      </div>
    </div>
  );
}
