import { useState, useEffect } from 'react';
import Typewriter from '../components/Typewriter';

export default function NightPhasePage({ gameState, me, onProceed, isLoading }) {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Delay showing the proceed button for dramatic effect
    const timer = setTimeout(() => setShowButton(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  const isTraitor = me?.role === 'traitor';

  return (
    <div className="relative min-h-screen w-full bg-surface overflow-y-auto">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40" />
      {/* Grain & Vignette */}
      <div className="absolute inset-0 z-10 grain pointer-events-none" />
      <div className="absolute inset-0 z-20 vignette pointer-events-none" />

      <main className="relative z-30 flex flex-col items-center justify-center min-h-screen py-12 px-8">
        <div className="max-w-[640px] w-full text-center">
          {/* Moon icon */}
          <div className="mb-8 animate-fade-in-up">
            <span className="material-symbols-outlined text-secondary/60 text-[80px]">
              dark_mode
            </span>
          </div>

          <h1 className="font-display text-[36px] leading-[44px] font-bold text-on-surface/80 text-stamp tracking-[0.15em] uppercase mb-4 animate-fade-in-up"
            style={{ animationDelay: '0.3s' }}
          >
            THE CITY SLEEPS
          </h1>

          <p className="font-body text-[16px] text-on-surface-variant/60 mb-2 min-h-[24px]">
            <Typewriter text="Darkness falls over the investigation room." speed={40} delay={400} />
          </p>
          <p className="font-body text-[14px] text-on-surface-variant/40 mb-12 min-h-[20px]">
            <Typewriter 
              text={isTraitor
                ? 'As the Deceiver, the shadows are your ally. A target will be chosen...'
                : 'The Deceiver moves in the shadows. Someone may not survive the night.'
              }
              speed={45}
              delay={1500}
            />
          </p>

          {/* Silhouette figures */}
          <div className="flex justify-center gap-8 mb-12 animate-fade-in-up" style={{ animationDelay: '2s' }}>
            {gameState?.players?.filter(p => p.is_alive).map((p, i) => (
              <div key={p.player_id} className="flex flex-col items-center">
                <div className="w-16 h-20 bg-surface-container-highest/80 flex items-center justify-center shadow-lg">
                  <span className="material-symbols-outlined text-on-surface-variant/20 text-3xl">person</span>
                </div>
                <p className="font-label text-[9px] text-on-surface-variant/30 tracking-wider uppercase mt-2">
                  {p.character_name.split(' ')[0]}
                </p>
              </div>
            ))}
          </div>

          {/* Proceed button */}
          {showButton && (
            <button
              onClick={onProceed}
              disabled={isLoading}
              className="dymo-button group relative px-10 py-4 bg-surface-container-highest border-2 border-secondary/60 text-secondary font-label text-[12px] font-semibold uppercase tracking-widest hover:border-secondary transition-all duration-500 shadow-[4px_4px_0px_#000] animate-fade-in-up cursor-pointer"
            >
              <span className="relative z-10 font-bold">
                {isLoading ? 'THE SHADOWS MOVE...' : 'DAWN APPROACHES'}
              </span>
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
