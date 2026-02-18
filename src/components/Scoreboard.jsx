export default function Scoreboard({ players, scores, compact = false }) {
  const sorted = [...players]
    .map(name => ({ name, score: scores[name] || 0 }))
    .sort((a, b) => b.score - a.score);

  const maxScore = Math.max(...sorted.map(p => p.score), 1);

  if (compact) {
    return (
      <div className="glass-strong border-b border-white/5 py-4 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base">🏆</span>
            <h3 className="text-sm font-bold text-white">جدول امتیازات</h3>
          </div>
          <div className="space-y-2">
            {sorted.map(({ name, score }, i) => (
              <div key={name} className="flex items-center gap-3">
                <span className={`w-6 text-center text-sm font-bold ${
                  i === 0 && score > 0 ? 'text-yellow-400' :
                  i === 1 && score > 0 ? 'text-slate-300' :
                  i === 2 && score > 0 ? 'text-amber-600' :
                  'text-slate-600'
                }`}>
                  {i === 0 && score > 0 ? '🥇' : i === 1 && score > 0 ? '🥈' : i === 2 && score > 0 ? '🥉' : `${(i + 1).toLocaleString('fa-IR')}`}
                </span>
                <span className="text-sm text-white font-medium flex-1">{name}</span>
                <div className="w-24 h-1.5 bg-surface-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-l from-neon-purple to-neon-blue rounded-full transition-all duration-500"
                    style={{ width: `${(score / maxScore) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-neon-purple w-8 text-left">
                  {score.toLocaleString('fa-IR')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
