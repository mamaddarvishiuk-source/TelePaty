import { useMemo } from 'react';

export default function AnswerReveal({ question, answers, players, scores, roundNumber }) {
  const analysis = useMemo(() => {
    const freq = {};
    const normalized = {};

    Object.entries(answers).forEach(([player, answer]) => {
      const norm = answer.trim().toLowerCase().replace(/\s+/g, ' ');
      normalized[player] = norm;
      freq[norm] = (freq[norm] || 0) + 1;
    });

    const maxCount = Math.max(...Object.values(freq));
    const topAnswers = Object.keys(freq).filter(a => freq[a] === maxCount);
    const isTie = topAnswers.length > 1;
    const hasMajority = maxCount >= 2 && !isTie;

    const majorityAnswer = hasMajority ? topAnswers[0] : null;
    const majorityOriginal = majorityAnswer
      ? Object.entries(answers).find(([_, a]) => a.trim().toLowerCase().replace(/\s+/g, ' ') === majorityAnswer)?.[1]
      : null;

    const majorityPlayers = hasMajority
      ? Object.entries(normalized).filter(([_, n]) => n === majorityAnswer).map(([p]) => p)
      : [];

    // Group answers
    const groups = {};
    Object.entries(answers).forEach(([player, answer]) => {
      const norm = normalized[player];
      if (!groups[norm]) groups[norm] = { answer: answer, players: [], count: 0 };
      groups[norm].players.push(player);
      groups[norm].count++;
    });

    const sortedGroups = Object.values(groups).sort((a, b) => b.count - a.count);

    return {
      hasMajority,
      isTie,
      majorityAnswer: majorityOriginal,
      majorityPlayers,
      majorityCount: maxCount,
      sortedGroups,
      totalPlayers: players.length,
    };
  }, [answers, players]);

  return (
    <div className="w-full">
      {/* Question header */}
      <div className="text-center mb-6">
        <span className="inline-block px-4 py-1.5 rounded-full bg-neon-purple/10 border border-neon-purple/20 text-neon-purple text-sm font-medium mb-3">
          نتیجه راند {roundNumber.toLocaleString('fa-IR')}
        </span>
        <h3 className="text-lg text-slate-300 font-medium leading-relaxed">{question}</h3>
      </div>

      {/* Majority result */}
      {analysis.hasMajority ? (
        <div className="glass rounded-2xl p-6 neon-border mb-6 text-center animate-scale-in">
          <p className="text-sm text-slate-400 mb-2">رایج‌ترین جواب 🎯</p>
          <h2 className="text-3xl font-black gradient-text mb-3">{analysis.majorityAnswer}</h2>
          <p className="text-neon-purple text-sm font-bold">
            {analysis.majorityCount.toLocaleString('fa-IR')} نفر از {analysis.totalPlayers.toLocaleString('fa-IR')} نفر
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {analysis.majorityPlayers.map(name => (
              <span
                key={name}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neon-purple/15 border border-neon-purple/30 text-sm text-white font-medium animate-scale-in"
              >
                <span className="text-xs">✨</span>
                {name}
                <span className="text-neon-purple text-xs font-bold">+۱</span>
              </span>
            ))}
          </div>
        </div>
      ) : analysis.isTie ? (
        <div className="glass rounded-2xl p-6 border border-yellow-500/20 mb-6 text-center animate-scale-in">
          <p className="text-3xl mb-2">⚖️</p>
          <h2 className="text-xl font-bold text-yellow-400 mb-2">تساوی!</h2>
          <p className="text-sm text-slate-400">
            چند جواب هم‌تعداد بودن. هیچکس امتیاز نمی‌گیره!
          </p>
        </div>
      ) : (
        <div className="glass rounded-2xl p-6 border border-slate-600/20 mb-6 text-center animate-scale-in">
          <p className="text-3xl mb-2">🤷</p>
          <h2 className="text-xl font-bold text-slate-300 mb-2">هم‌فکری نبود!</h2>
          <p className="text-sm text-slate-400">
            هیچ دو نفری جواب یکسان نداشتن. امتیازی داده نمی‌شه.
          </p>
        </div>
      )}

      {/* All answers grouped */}
      <div className="space-y-3">
        <h4 className="text-sm text-slate-500 font-medium px-1">همه جواب‌ها</h4>
        {analysis.sortedGroups.map((group, i) => {
          const isMajority = analysis.hasMajority && i === 0;
          return (
            <div
              key={i}
              className={`rounded-2xl p-4 transition-all ${
                isMajority
                  ? 'glass neon-border'
                  : 'bg-surface-800/40 border border-white/5'
              }`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {isMajority && <span className="text-sm">🏆</span>}
                  <span className={`font-bold text-base ${isMajority ? 'text-white' : 'text-slate-300'}`}>
                    {group.answer}
                  </span>
                </div>
                <span className={`text-sm font-bold rounded-full px-2.5 py-0.5 ${
                  isMajority
                    ? 'bg-neon-purple/20 text-neon-purple'
                    : 'bg-surface-700/60 text-slate-500'
                }`}>
                  {group.count.toLocaleString('fa-IR')}×
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {group.players.map(name => (
                  <span
                    key={name}
                    className={`text-xs px-2.5 py-1 rounded-full ${
                      isMajority
                        ? 'bg-neon-purple/10 text-neon-purple border border-neon-purple/20'
                        : 'bg-surface-700/40 text-slate-400 border border-white/5'
                    }`}
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
