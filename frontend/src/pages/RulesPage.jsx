export default function RulesPage({ onContinue }) {
  const rules = [
    { icon: 'groups', title: 'THE SETUP', desc: '5 players enter: You and 4 AI suspects. Roles are assigned secretly — 1 Traitor hides among 4 Innocents.' },
    { icon: 'chat', title: 'THE DAY PHASE', desc: 'A 60-second discussion. Chat with the suspects, accuse, defend, and analyze behavior. AI agents respond to your messages and talk among themselves.' },
    { icon: 'how_to_vote', title: 'THE VOTE', desc: 'When time runs out, everyone votes. The player with the most votes is banished and their role is revealed.' },
    { icon: 'dark_mode', title: 'THE NIGHT', desc: 'The Traitor strikes. One Innocent is eliminated under cover of darkness.' },
    { icon: 'emoji_events', title: 'VICTORY', desc: 'Innocents win by banishing the Traitor. The Traitor wins when they equal or outnumber the Innocents.' },
  ];

  return (
    <div className="relative min-h-screen w-full bg-surface overflow-hidden">
      {/* Grain & Vignette */}
      <div className="absolute inset-0 z-10 grain" />
      <div className="absolute inset-0 z-20 vignette" />

      <main className="relative z-30 flex flex-col items-center py-16 px-8">
        {/* Manila folder header */}
        <div className="max-w-[720px] w-full">
          <div className="bg-[#c4a96a]/10 border border-secondary/30 p-1 mb-2 inline-block">
            <span className="font-label text-[12px] font-semibold text-secondary tracking-[0.2em] uppercase">
              CLASSIFIED
            </span>
          </div>

          <h1 className="font-display text-[36px] leading-[44px] font-bold text-secondary text-stamp tracking-[0.15em] uppercase mb-2">
            MISSION BRIEFING
          </h1>
          <p className="font-body text-[14px] text-on-surface-variant/70 mb-12 tracking-wide">
            Case File #0047 — Read carefully, Detective. Lives depend on it.
          </p>

          {/* Rules cards */}
          <div className="space-y-6">
            {rules.map((rule, i) => (
              <div
                key={i}
                className="animate-fade-in-up bg-surface-container border border-outline-variant/30 p-6 flex gap-6 items-start shadow-[4px_4px_0px_rgba(0,0,0,0.3)]"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="w-12 h-12 bg-surface-container-highest flex items-center justify-center border border-outline-variant shrink-0">
                  <span className="material-symbols-outlined text-secondary text-2xl">{rule.icon}</span>
                </div>
                <div>
                  <h3 className="font-headline text-[16px] font-bold text-secondary tracking-[0.1em] uppercase mb-2">
                    {rule.title}
                  </h3>
                  <p className="font-body text-[14px] text-on-surface-variant leading-relaxed">
                    {rule.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Continue button */}
          <div className="mt-12 flex justify-center">
            <button
              onClick={onContinue}
              className="dymo-button group relative px-10 py-4 bg-surface-container-highest border-2 border-secondary text-secondary font-label text-[12px] font-semibold uppercase tracking-widest hover:text-on-tertiary-fixed-variant hover:border-on-tertiary-fixed-variant transition-all duration-500 shadow-[4px_4px_0px_#000]"
            >
              <span className="relative z-10">SELECT SUSPECTS</span>
              <div className="absolute inset-0 bg-on-tertiary-fixed-variant/0 group-hover:bg-on-tertiary-fixed-variant/10 transition-colors duration-500" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
