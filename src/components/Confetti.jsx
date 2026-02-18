import { useMemo } from 'react';

const CONFETTI_COLORS = ['#a855f7', '#3b82f6', '#06b6d4', '#ec4899', '#f59e0b', '#10b981'];
const CONFETTI_COUNT = 40;

export default function Confetti() {
  const particles = useMemo(() => {
    return Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      delay: `${Math.random() * 0.8}s`,
      duration: `${1 + Math.random() * 1.5}s`,
      size: `${4 + Math.random() * 6}px`,
      rotation: `${Math.random() * 360}deg`,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute top-0"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animation: `confetti-fall ${p.duration} ease-out ${p.delay} forwards`,
            transform: `rotate(${p.rotation})`,
          }}
        />
      ))}
    </div>
  );
}
