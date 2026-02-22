import { useState, useRef, useEffect } from 'react';
import defaultQuestions from '../data/questions';

export default function HomeScreen({ multiplayer }) {
  const [mode, setMode] = useState(null); // null | 'create' | 'join'
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const nameRef = useRef(null);
  const codeRef = useRef(null);

  useEffect(() => {
    if (mode && nameRef.current) nameRef.current.focus();
  }, [mode]);

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    await multiplayer.createRoom(trimmed, [...defaultQuestions]);
  };

  const handleJoin = async () => {
    const trimmedName = name.trim();
    const trimmedCode = code.trim();
    if (!trimmedName || !trimmedCode) return;
    await multiplayer.joinRoom(trimmedCode, trimmedName);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (mode === 'create') handleCreate();
      else if (mode === 'join') handleJoin();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      {/* Logo */}
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
          Developed by : Mohammad Darvishi
          </p>
        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/20">
          <span className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
          <span className="text-xs text-neon-cyan font-medium">آنلاین — هر کسی از هر جایی</span>
        </div>
      </div>

      {/* Mode selection */}
      {!mode && (
    <div className="w-full max-w-sm animate-slide-up space-y-3">
       <button
      onClick={() => setMode('create')}
      className="btn-press w-full py-4 rounded-2xl bg-gradient-to-l from-neon-purple via-neon-blue to-neon-cyan text-white font-black text-xl hover:shadow-xl hover:shadow-neon-purple/30 hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group"
         >
      <span className="relative z-10">ساخت اتاق جدید 🎮</span>
      <div className="absolute inset-0 bg-gradient-to-l from-neon-pink via-neon-purple to-neon-blue opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </button>

    <button
      onClick={() => setMode('join')}
      className="btn-press w-full py-4 rounded-2xl glass border border-white/10 text-white font-bold text-xl hover:border-neon-purple/30 hover:shadow-lg hover:shadow-neon-purple/20 transition-all duration-300"
    >
      ورود به اتاق 🚪
    </button>

    <button
      onClick={() => setMode('howto')}
      className="btn-press w-full py-3 rounded-2xl text-slate-400 text-sm hover:text-white transition-colors"
    >
      چطوری بازی کنیم؟ 📖
    </button>
  </div>
)}

      {/* Create room */}
      {mode === 'create' && (
        <div className="w-full max-w-sm animate-scale-in">
          <div className="glass-strong rounded-3xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="text-2xl">🎮</span>
              ساخت اتاق جدید
            </h2>

            <div className="mb-4">
              <label className="text-sm text-slate-400 mb-1.5 block">اسم تو</label>
              <input
                ref={nameRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="اسمت رو وارد کن..."
                className="w-full bg-surface-800/80 text-white rounded-xl px-4 py-3 border border-white/5 focus:border-neon-purple/50 transition-colors text-base"
                maxLength={20}
              />
            </div>

            {multiplayer.error && (
              <p className="text-neon-pink text-sm mb-3 animate-scale-in">{multiplayer.error}</p>
            )}

            <button
              onClick={handleCreate}
              disabled={!name.trim() || multiplayer.loading}
              className="btn-press w-full py-3.5 rounded-xl bg-gradient-to-l from-neon-purple to-neon-blue text-white font-bold text-lg disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-neon-purple/30 transition-all"
            >
              {multiplayer.loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  در حال ساخت...
                </span>
              ) : 'بزن بریم! 🚀'}
            </button>
          </div>

          <button
            onClick={() => { setMode(null); multiplayer.setError(''); }}
            className="w-full mt-4 py-2 text-slate-500 text-sm hover:text-slate-300 transition-colors"
          >
            ← بازگشت
          </button>
        </div>
      )}

      {/* Join room */}
      {mode === 'join' && (
        <div className="w-full max-w-sm animate-scale-in">
          <div className="glass-strong rounded-3xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="text-2xl">🚪</span>
              ورود به اتاق
            </h2>

            <div className="mb-4">
              <label className="text-sm text-slate-400 mb-1.5 block">کد اتاق</label>
              <input
                ref={codeRef}
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                onKeyDown={handleKeyDown}
                placeholder="مثلاً ABC123"
                className="w-full bg-surface-800/80 text-white rounded-xl px-4 py-3 border border-white/5 focus:border-neon-blue/50 transition-colors text-center text-2xl font-mono tracking-[0.3em] uppercase"
                maxLength={6}
                dir="ltr"
                style={{ direction: 'ltr' }}
              />
            </div>

            <div className="mb-4">
              <label className="text-sm text-slate-400 mb-1.5 block">اسم تو</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="اسمت رو وارد کن..."
                className="w-full bg-surface-800/80 text-white rounded-xl px-4 py-3 border border-white/5 focus:border-neon-purple/50 transition-colors text-base"
                maxLength={20}
              />
            </div>

            {multiplayer.error && (
              <p className="text-neon-pink text-sm mb-3 animate-scale-in">{multiplayer.error}</p>
            )}

            <button
              onClick={handleJoin}
              disabled={!name.trim() || !code.trim() || multiplayer.loading}
              className="btn-press w-full py-3.5 rounded-xl bg-gradient-to-l from-neon-blue to-neon-cyan text-white font-bold text-lg disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-neon-blue/30 transition-all"
            >
              {multiplayer.loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  در حال ورود...
                </span>
              ) : 'وارد شو ✓'}
            </button>
          </div>

          <button
            onClick={() => { setMode(null); multiplayer.setError(''); }}
            className="w-full mt-4 py-2 text-slate-500 text-sm hover:text-slate-300 transition-colors"
          >
            ← بازگشت
          </button>
        </div>
      )}
      {mode === 'howto' && (
  <div className="w-full max-w-sm animate-scale-in">
    <div className="glass-strong rounded-3xl p-6 sm:p-8">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <span className="text-2xl">📖</span>
        چطوری بازی کنیم؟
      </h2>
      <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
        <div className="flex gap-3">
          <span className="w-8 h-8 rounded-full bg-neon-purple/20 text-neon-purple flex items-center justify-center font-bold flex-shrink-0">۱</span>
          <p>یه نفر اتاق می‌سازه و <span className="text-white font-bold">کد اتاق</span> رو به بقیه می‌ده.</p>
        </div>
        <div className="flex gap-3">
          <span className="w-8 h-8 rounded-full bg-neon-purple/20 text-neon-purple flex items-center justify-center font-bold flex-shrink-0">۲</span>
          <p>همه از <span className="text-white font-bold">گوشی خودشون</span> وارد اتاق می‌شن.</p>
        </div>
        <div className="flex gap-3">
          <span className="w-8 h-8 rounded-full bg-neon-blue/20 text-neon-blue flex items-center justify-center font-bold flex-shrink-0">۳</span>
          <p>یه <span className="text-white font-bold">سوال</span> میاد — هر کسی جوابشو می‌نویسه.</p>
        </div>
        <div className="flex gap-3">
          <span className="w-8 h-8 rounded-full bg-neon-blue/20 text-neon-blue flex items-center justify-center font-bold flex-shrink-0">۴</span>
          <p>وقتی همه جواب دادن، جواب‌ها <span className="text-white font-bold">نشون داده می‌شه</span>.</p>
        </div>
        <div className="flex gap-3">
          <span className="w-8 h-8 rounded-full bg-neon-cyan/20 text-neon-cyan flex items-center justify-center font-bold flex-shrink-0">۵</span>
          <p>هر کی جوابش مثل <span className="text-white font-bold">اکثریت</span> باشه، <span className="text-neon-purple font-bold">۱ امتیاز</span> می‌گیره! 🏆</p>
        </div>
      </div>
    </div>
    <button
      onClick={() => setMode(null)}
      className="w-full mt-4 py-2 text-slate-500 text-sm hover:text-slate-300 transition-colors"
    >
      ← بازگشت
    </button>
        <div className="mt-4 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
  <p className="text-yellow-300 text-xs leading-relaxed">
    💡 <span className="font-bold">نکته:</span> سعی کنید جواب‌ها رو ساده و کوتاه بنویسید. مثلاً به جای «شهر اصفهان» فقط بنویسید «اصفهان». املای یکسان = جواب یکسان!
  </p>
</div>
  </div>
)}
    </div>
  );
}
