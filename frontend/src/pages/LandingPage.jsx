import { useEffect, useRef } from 'react';

export default function LandingPage({ onStart }) {
  const titleRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!titleRef.current) return;
      const moveX = (e.clientX - window.innerWidth / 2) / 100;
      const moveY = (e.clientY - window.innerHeight / 2) / 100;
      titleRef.current.style.transform = `translate(${moveX}px, ${moveY}px)`;
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative h-screen w-full bg-surface overflow-hidden">
      {/* Background noir gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-surface via-surface-container-low to-surface opacity-90" />

      {/* Rain streaks */}
      <div className="absolute inset-0 overflow-hidden opacity-40">
        {[10, 25, 40, 55, 70, 85, 95].map((left, i) => (
          <div
            key={i}
            className="rain-streak"
            style={{ left: `${left}%`, animationDelay: `${i * 0.3}s`, opacity: 0.15 + (i % 3) * 0.1 }}
          />
        ))}
      </div>

      {/* Grain & Vignette */}
      <div className="absolute inset-0 z-10 grain" />
      <div className="absolute inset-0 z-20 vignette" />

      {/* Main Content */}
      <main className="relative z-30 h-full w-full flex flex-col items-center justify-center light-flicker">
        {/* Desk surface */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-surface-container-low opacity-90 border-t border-outline-variant shadow-2xl" />

        {/* Hero */}
        <div className="relative z-40 flex flex-col items-center text-center max-w-[640px] animate-fade-in-up">
          <h1
            ref={titleRef}
            className="font-display text-[48px] leading-[56px] font-bold text-secondary text-stamp mb-2 tracking-[0.2em] uppercase"
          >
            DECEIVER
          </h1>
          <p className="font-label text-[12px] leading-[16px] font-semibold text-on-secondary-fixed-variant tracking-[0.4em] mb-12 opacity-80 uppercase">
            TRUST NO ONE. FIND THE TRAITOR.
          </p>

          <button
            onClick={onStart}
            className="dymo-button group relative px-10 py-4 bg-surface-container-highest border-2 border-secondary text-secondary font-label text-[12px] leading-[16px] font-semibold uppercase tracking-widest hover:text-on-tertiary-fixed-variant hover:border-on-tertiary-fixed-variant transition-all duration-500 shadow-[4px_4px_0px_#000]"
          >
            <span className="relative z-10">BEGIN INVESTIGATION</span>
            <div className="absolute inset-0 bg-on-tertiary-fixed-variant/0 group-hover:bg-on-tertiary-fixed-variant/10 transition-colors duration-500" />
            <div className="absolute -inset-1 bg-on-tertiary-fixed-variant/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>

        {/* Desk props */}
        <div className="absolute bottom-0 w-full h-1/3 flex justify-between items-end px-16 pb-12 pointer-events-none select-none">
          <div className="flex items-end gap-12">
            <div className="rotate-[-1.5deg] bg-[#d1c2a4] w-48 h-64 p-4 shadow-2xl border border-black/10">
              <div className="border-b border-black/20 pb-2 mb-4">
                <span className="font-label text-[10px] text-black/60 uppercase">Dossier: SV-402</span>
              </div>
              <div className="w-full h-32 bg-black/5 flex items-center justify-center">
                <span className="material-symbols-outlined text-black/20 text-4xl">folder_shared</span>
              </div>
            </div>
          </div>
          <div className="flex items-end gap-8">
            <div className="rotate-[2deg] w-32 h-16 bg-surface-variant border border-outline rounded-lg flex items-center justify-center shadow-lg">
              <div className="w-1 h-8 bg-primary/40 rounded-full -rotate-45 relative">
                <div className="absolute top-0 w-1 h-1 bg-error rounded-full blur-[2px] animate-pulse" />
              </div>
            </div>
            <div className="font-body text-[14px] text-on-surface-variant/40 tracking-tighter uppercase">
              CASE NO. 0047 — CLASSIFIED
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
