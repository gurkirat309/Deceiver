import { getCharacterImage } from '../utils';

export default function VotingPage({ gameState, me, onVote, isLoading }) {
  if (!gameState) return null;

  const votableTargets = gameState.players.filter(
    p => p.is_alive && p.player_id !== me?.player_id
  );

  return (
    <div className="relative min-h-screen w-full bg-surface overflow-hidden">
      {/* Grain & Vignette */}
      <div className="absolute inset-0 z-10 grain" />
      <div className="absolute inset-0 z-20 vignette" />

      <main className="relative z-30 flex flex-col items-center justify-center min-h-screen py-12 px-8">
        <div className="max-w-[800px] w-full text-center">
          {/* Header */}
          <div className="mb-2">
            <span className="font-label text-[12px] font-semibold text-tertiary tracking-[0.2em] uppercase animate-pulse">
              INTERROGATION ROOM
            </span>
          </div>
          <h1 className="font-display text-[36px] leading-[44px] font-bold text-secondary text-stamp tracking-[0.15em] uppercase mb-2 animate-fade-in-up">
            CAST YOUR VOTE
          </h1>
          <p className="font-body text-[14px] text-on-surface-variant/70 mb-10">
            Who is the Deceiver? Choose the suspect you wish to banish.
          </p>

          {/* Suspect Lineup */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
            {votableTargets.map((p, i) => (
              <button
                key={p.player_id}
                onClick={() => !isLoading && onVote(p.player_id)}
                disabled={isLoading}
                className="group animate-fade-in-up bg-surface-container border-2 border-outline-variant/30 p-0 
                  shadow-[4px_4px_0px_rgba(0,0,0,0.4)] transition-all duration-300
                  hover:border-tertiary hover:shadow-[0_0_20px_rgba(138,26,26,0.3)]
                  disabled:opacity-50 disabled:cursor-wait"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {/* Photo */}
                <div className="relative w-full aspect-square bg-surface-container-highest overflow-hidden">
                  <img
                    src={getCharacterImage(p.character_name)}
                    alt={p.character_name}
                    className="w-full h-full object-cover filter grayscale-[50%] contrast-[1.3] group-hover:grayscale-0 transition-all duration-500"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-tertiary/0 group-hover:bg-tertiary/20 transition-colors duration-300 flex items-center justify-center">
                    <span className="material-symbols-outlined text-tertiary text-4xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      gavel
                    </span>
                  </div>
                </div>

                {/* Name */}
                <div className="p-4">
                  <p className="font-headline text-[14px] font-bold text-on-surface tracking-[0.05em] uppercase">
                    {p.character_name}
                  </p>
                  <p className="font-label text-[10px] text-tertiary/70 tracking-widest uppercase mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    VOTE TO BANISH
                  </p>
                </div>
              </button>
            ))}
          </div>

          {isLoading && (
            <div className="flex items-center justify-center gap-3">
              <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
              <p className="font-label text-[12px] text-secondary tracking-widest uppercase">
                THE JURY DELIBERATES...
              </p>
              <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
