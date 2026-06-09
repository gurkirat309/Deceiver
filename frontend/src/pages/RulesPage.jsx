import Typewriter from '../components/Typewriter';

export default function RulesPage({ onContinue }) {
  const rules = [
    { icon: 'groups', title: 'THE SETUP', desc: '5 players enter: You and 4 AI suspects. Roles are assigned secretly — 1 Traitor hides among 4 Innocents.' },
    { icon: 'chat', title: 'THE DAY PHASE', desc: 'A 60-second discussion. Chat with the suspects, accuse, defend, and analyze behavior. AI agents respond to your messages and talk among themselves.' },
    { icon: 'how_to_vote', title: 'THE VOTE', desc: 'When time runs out, everyone votes. The player with the most votes is banished and their role is revealed.' },
    { icon: 'dark_mode', title: 'THE NIGHT', desc: 'The Traitor strikes. One Innocent is eliminated under cover of darkness.' },
    { icon: 'emoji_events', title: 'VICTORY', desc: 'Innocents win by banishing the Traitor. The Traitor wins when they equal or outnumber the Innocents.' },
  ];

  const caseBriefingText = 
    "Detective, we have a critical situation at the warehouse. One of the suspects in the lineup is a deep-cover Deceiver. The other four suspects are Innocents, but they are paranoid and scared. " +
    "You have 60 seconds each day to interrogate the lineup, cross-examine their claims, and look for inconsistencies. When the time expires, you must cast your vote. Banishing the Deceiver wins the case. Falling to banish them in time means the shadows win. Read the protocol on the right carefully. Lives depend on it.";

  return (
    <div className="relative min-h-screen w-full bg-surface overflow-y-auto">
      {/* Grain & Vignette */}
      <div className="absolute inset-0 z-10 grain pointer-events-none" />
      <div className="absolute inset-0 z-20 vignette pointer-events-none" />

      {/* Main Corkboard Container */}
      <main className="relative z-30 max-w-[1200px] mx-auto py-12 px-6 md:py-16 md:px-12 flex flex-col justify-center min-h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-10 items-start w-full">
          
          {/* Left Column: Manila Folder Briefing */}
          <div className="bg-[#dfccac] text-neutral-900 p-8 shadow-[8px_8px_0px_rgba(0,0,0,0.5)] border-2 border-neutral-900 rotate-[-1deg] animate-fade-in-up flex flex-col justify-between min-h-[580px]">
            <div>
              {/* Manila folder header */}
              <div className="flex justify-between items-start border-b-2 border-neutral-900/30 pb-4 mb-6">
                <div>
                  <span className="font-label text-[10px] font-bold tracking-[0.2em] uppercase bg-neutral-900/10 px-2 py-1 rounded text-neutral-800">
                    CLASSIFIED INFO
                  </span>
                  <h2 className="font-headline text-[13px] font-bold text-neutral-700 tracking-wider uppercase mt-3">
                    CASE NO. SV-0047
                  </h2>
                </div>
                <span className="material-symbols-outlined text-neutral-600 text-3xl">folder_zip</span>
              </div>

              <h1 className="font-display text-[28px] md:text-[32px] leading-[36px] md:leading-[40px] font-bold text-neutral-950 tracking-[0.1em] uppercase mb-4 text-stamp">
                MISSION BRIEFING
              </h1>

              <div className="font-body text-[13px] leading-relaxed text-neutral-900 space-y-4">
                <p className="font-bold border-b border-neutral-900/10 pb-1">
                  OFFICIAL INVESTIGATION PROTOCOL
                </p>
                <div className="min-h-[220px]">
                  <Typewriter 
                    text={caseBriefingText} 
                    speed={25} 
                    delay={300} 
                    showCursor={true}
                    className="text-neutral-900"
                  />
                </div>
              </div>
            </div>

            {/* Select Suspects Button inside the folder to prevent overlap */}
            <div className="mt-8 pt-4 border-t border-neutral-900/10">
              <button
                onClick={onContinue}
                className="dymo-button w-full py-4 bg-neutral-950 border-2 border-neutral-950 text-secondary font-label text-[12px] font-bold uppercase tracking-widest hover:bg-neutral-850 hover:text-white transition-all duration-300 shadow-[4px_4px_0px_#7c6239] cursor-pointer"
              >
                SELECT SUSPECTS
              </button>
            </div>
          </div>

          {/* Right Column: Corkboard Pinned Rules */}
          <div className="flex flex-col gap-6 w-full lg:pl-6">
            <div className="border-b border-outline-variant/20 pb-4 mb-2">
              <span className="font-label text-[12px] font-bold text-secondary tracking-[0.3em] uppercase">
                INVESTIGATION PROTOCOLS
              </span>
              <p className="font-body text-[13px] text-on-surface-variant/50 mt-1">
                Familiarize yourself with the room mechanics before entering.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {rules.map((rule, i) => {
                // Alternating slight rotations for taped document look
                const rotation = i % 2 === 0 ? 'rotate-[0.5deg]' : 'rotate-[-0.8deg]';
                // Make the 5th rule span both columns for visual balance
                const spanClass = i === 4 ? 'md:col-span-2' : '';

                return (
                  <div
                    key={i}
                    className={`animate-fade-in-up bg-surface-container border-2 border-outline-variant/35 p-6 flex flex-col justify-between shadow-[6px_6px_0px_rgba(0,0,0,0.5)] relative group hover:border-secondary transition-all duration-300 ${rotation} ${spanClass}`}
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    {/* Push-pin tape look */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-14 h-5 bg-[#c4a96a]/20 border border-secondary/15 rotate-[-3deg] pointer-events-none group-hover:bg-[#c4a96a]/30 transition-colors" />

                    <div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-surface-container-highest flex items-center justify-center border border-outline-variant/40 shrink-0">
                          <span className="material-symbols-outlined text-secondary text-xl font-semibold">{rule.icon}</span>
                        </div>
                        <h3 className="font-headline text-[15px] font-bold text-secondary tracking-[0.1em] uppercase">
                          {rule.title}
                        </h3>
                      </div>
                      <p className="font-body text-[13px] text-on-surface-variant leading-relaxed">
                        {rule.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
