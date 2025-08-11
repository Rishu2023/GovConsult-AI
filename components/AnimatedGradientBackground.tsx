import React from 'react';

export const AnimatedGradientBackground: React.FC = () => {
  return (
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
      <style>{`
        @keyframes move {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
        .gradient-blur {
          position: absolute;
          width: 200%;
          height: 200%;
          top: 50%;
          left: 50%;
          animation: move 40s linear infinite;
        }
        .gradient-blur::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: conic-gradient(
            from 90deg at 50% 50%,
            hsl(var(--color-primary-hue), 90%, 80%),
            #ffc0cb,
            #00ffff,
            hsl(var(--color-primary-hue), 90%, 80%)
          );
          filter: blur(100px);
          opacity: 0.15;
          .dark & {
            opacity: 0.2;
          }
        }
      `}</style>
      <div className="gradient-blur"></div>
    </div>
  );
};