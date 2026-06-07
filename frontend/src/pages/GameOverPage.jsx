import { getCharacterImage } from '../utils';

export default function GameOverPage({ gameState, onRestart }) {
  if (!gameState) return null;

  const innocentsWin = gameState.winner === 'innocents';
  const me = gameState.players.find(p => p.is_human);
  const myRole = me?.role || 'innocent';

  // Did the human win?
  const humanWon = (innocentsWin && myRole === 'innocent') || (!innocentsWin && myRole === 'traitor');

  return (
    <div className="relative min-h-screen w-full bg-surface overflow-hidden">
      {/* Grain & Vignette */}
      <div className="absolute inset-0 z-10 grain" />
      <div className="absolute inset-0 z-20 vignette" />

      <main className="relative z-30 flex flex-col items-center justify-center min-h-screen py-12 px-8">
        <div className="max-w-[700px] w-full text-center">

          {/* Main Verdict Stamp */}
          <div className="mb-6 animate-stamp-in">
            <div className={`inline-block px-10 py-6 border-4 rotate-[-2deg]
              ${innocentsWin ? 'border-secondary' : 'border-tertiary'}`}
            >
              <p className={`font-display text-[42px] font-bold tracking-[0.2em] uppercase text-stamp
                ${innocentsWin ? 'text-secondary' : 'text-tertiary'}`}
              >
                {innocentsWin ? 'CASE CLOSED' : 'CASE COLD'}
              </p>
            </div>
          </div>

          {/* Subtitle */}
          <p className="font-headline text-[20px] font-bold text-on-surface tracking-[0.1em] uppercase mb-2 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            {innocentsWin
              ? 'THE DECEIVER HAS BEEN UNMASKED'
              : 'THE DECEIVER PREVAILS'
            }
          </p>
          <p className="font-body text-[14px] text-on-surface-variant/60 mb-10 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            {humanWon
              ? 'Well played, Detective. Your instincts served you well.'
              : 'The shadows have claimed this case. Better luck next time.'
            }
          </p>

          {/* Player Roster - Role Reveal */}
          <div className="bg-surface-container border border-outline-variant/30 p-6 mb-10 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
            <h3 className="font-label text-[10px] font-semibold text-on-surface-variant tracking-[0.2em] uppercase mb-4">
              CASE FILE — FINAL ROSTER
            </h3>
            <div className="space-y-3">
              {gameState.players.map((p) => (
                <div
                  key={p.player_id}
                  className={`flex items-center justify-between py-3 px-4 border border-outline-variant/10
                    ${!p.is_alive ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-surface-container-highest flex items-center justify-center shrink-0 overflow-hidden">
                      {p.is_human ? (
                        <span className="material-symbols-outlined text-secondary text-lg">person</span>
                      ) : (
                        <img
                          src={getCharacterImage(p.character_name)}
                          alt={p.character_name}
                          className="w-full h-full object-cover filter grayscale"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      )}
                    </div>
                    <div className="text-left">
                      <p className="font-body text-[14px] text-on-surface">
                        {p.character_name}
                        {p.is_human && <span className="text-secondary ml-1">(You)</span>}
                      </p>
                      <p className="font-label text-[9px] text-on-surface-variant/50 tracking-wider uppercase">
                        {p.is_alive ? 'SURVIVED' : 'ELIMINATED'}
                      </p>
                    </div>
                  </div>

                  <div className={`px-3 py-1 font-label text-[10px] font-semibold tracking-[0.15em] uppercase border
                    ${p.role === 'traitor'
                      ? 'text-tertiary border-tertiary bg-tertiary/10'
                      : 'text-primary border-primary/40 bg-primary/5'
                    }`}
                  >
                    {p.role === 'traitor' ? 'DECEIVER' : 'INNOCENT'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Elimination Timeline */}
          {gameState.eliminated_players.length > 0 && (
            <div className="bg-surface-container border border-outline-variant/20 p-6 mb-10 text-left animate-fade-in-up" style={{ animationDelay: '1s' }}>
              <h3 className="font-label text-[10px] font-semibold text-on-surface-variant tracking-[0.2em] uppercase mb-4">
                ELIMINATION TIMELINE
              </h3>
              <div className="space-y-2">
                {gameState.eliminated_players.map((e, i) => (
                  <div key={i} className="flex items-center gap-4 py-2 border-b border-outline-variant/10 last:border-0">
                    <span className="font-label text-[10px] text-on-surface-variant/40 w-16">
                      Round {e.round_eliminated}
                    </span>
                    <span className={`font-body text-[13px] ${e.role === 'traitor' ? 'text-secondary' : 'text-tertiary'}`}>
                      {e.character_name}
                    </span>
                    <span className="font-label text-[9px] text-on-surface-variant/40 tracking-wider uppercase">
                      {e.reason === 'voted_out' ? 'BANISHED' : 'NIGHT KILL'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Restart */}
          <button
            onClick={onRestart}
            className="dymo-button group relative px-10 py-4 bg-surface-container-highest border-2 border-secondary text-secondary font-label text-[12px] font-semibold uppercase tracking-widest hover:text-on-tertiary-fixed-variant hover:border-on-tertiary-fixed-variant transition-all duration-500 shadow-[4px_4px_0px_#000] animate-fade-in-up"
            style={{ animationDelay: '1.2s' }}
          >
            <span className="relative z-10">NEW INVESTIGATION</span>
          </button>
        </div>
      </main>
    </div>
  );
}
