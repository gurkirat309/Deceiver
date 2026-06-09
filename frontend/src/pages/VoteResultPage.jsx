import { getCharacterImage } from '../utils';

export default function VoteResultPage({ gameState, onContinue }) {
  if (!gameState) return null;

  const eliminated = gameState.last_eliminated;
  const voteDetails = gameState.vote_details || [];

  return (
    <div className="relative min-h-screen w-full bg-surface overflow-y-auto">
      {/* Grain & Vignette */}
      <div className="absolute inset-0 z-10 grain" />
      <div className="absolute inset-0 z-20 vignette" />

      <main className="relative z-30 flex flex-col items-center justify-center min-h-screen py-12 px-8">
        <div className="max-w-[640px] w-full text-center">

          {/* Verdict Stamp */}
          {eliminated && (
            <div className="mb-8 animate-stamp-in">
              <div className={`inline-block px-8 py-4 border-4 rotate-[-2deg]
                ${eliminated.role === 'traitor'
                  ? 'border-secondary text-secondary'
                  : 'border-tertiary text-tertiary'
                }`}
              >
                <p className="font-display text-[36px] font-bold tracking-[0.15em] uppercase text-stamp">
                  BANISHED
                </p>
              </div>
            </div>
          )}

          {/* Eliminated Player Card */}
          {eliminated && (
            <div className="bg-surface-container border border-outline-variant/30 p-8 shadow-[4px_4px_0px_rgba(0,0,0,0.4)] mb-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="w-24 h-24 mx-auto mb-4 bg-surface-container-highest overflow-hidden">
                <img
                  src={getCharacterImage(eliminated.character_name)}
                  alt={eliminated.character_name}
                  className="w-full h-full object-cover filter grayscale contrast-[1.5]"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
              <h2 className="font-headline text-[24px] font-bold text-on-surface tracking-[0.1em] uppercase mb-2">
                {eliminated.character_name}
              </h2>
              <div className={`inline-block px-4 py-1 font-label text-[12px] font-semibold tracking-[0.2em] uppercase border
                ${eliminated.role === 'traitor'
                  ? 'text-secondary border-secondary bg-secondary/10'
                  : 'text-tertiary border-tertiary bg-tertiary/10'
                }`}
              >
                {eliminated.role === 'traitor' ? '🔍 THE DECEIVER' : '✝ INNOCENT'}
              </div>
            </div>
          )}

          {/* Vote Log */}
          {voteDetails.length > 0 && (
            <div className="bg-surface-container border border-outline-variant/20 p-6 mb-8 text-left animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <h3 className="font-label text-[10px] font-semibold text-on-surface-variant tracking-[0.2em] uppercase mb-4">
                VOTE RECORD
              </h3>
              <div className="space-y-2">
                {voteDetails.map((v, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-outline-variant/10 last:border-0">
                    <span className="font-body text-[13px] text-on-surface">{v.voter}</span>
                    <span className="font-body text-[11px] text-on-surface-variant/50">voted for</span>
                    <span className="font-body text-[13px] text-tertiary font-bold">{v.voted_for}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Continue Button */}
          <div className="flex justify-center mt-6 mb-12">
            <button
              onClick={onContinue}
              className="dymo-button group relative px-10 py-4 bg-surface-container-highest border-2 border-secondary text-secondary font-label text-[12px] font-semibold uppercase tracking-widest hover:text-on-tertiary-fixed-variant hover:border-on-tertiary-fixed-variant transition-all duration-500 shadow-[4px_4px_0px_#000] animate-fade-in-up cursor-pointer"
              style={{ animationDelay: '0.8s' }}
            >
              <span className="relative z-10 font-bold">PROCEED TO NIGHT</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
