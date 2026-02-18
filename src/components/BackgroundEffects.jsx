export default function BackgroundEffects() {
  return (
    <>
      {/* Gradient orbs */}
      <div
        className="bg-orb"
        style={{
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, #a855f7, transparent)',
          top: '-100px',
          right: '-100px',
          animation: 'float 8s ease-in-out infinite',
        }}
      />
      <div
        className="bg-orb"
        style={{
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, #3b82f6, transparent)',
          bottom: '-50px',
          left: '-50px',
          animation: 'float 10s ease-in-out infinite reverse',
        }}
      />
      <div
        className="bg-orb"
        style={{
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, #06b6d4, transparent)',
          top: '40%',
          left: '30%',
          animation: 'float 12s ease-in-out infinite',
          opacity: '0.08',
        }}
      />
      {/* Grid overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(168, 85, 247, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(168, 85, 247, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
    </>
  );
}
