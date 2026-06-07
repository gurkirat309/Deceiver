export default function CharacterSelectPage({
  characters,
  selectedChars,
  onToggle,
  onConfirm,
  playerName,
  setPlayerName,
  isLoading,
}) {
  return (
    <div className="relative min-h-screen w-full bg-surface overflow-hidden">
      {/* Grain & Vignette */}
      <div className="absolute inset-0 z-10 grain" />
      <div className="absolute inset-0 z-20 vignette" />

      <main className="relative z-30 flex flex-col items-center py-12 px-8">
        <div className="max-w-[960px] w-full">
          {/* Header */}
          <div className="mb-2">
            <span className="font-label text-[12px] font-semibold text-on-surface-variant tracking-[0.2em] uppercase">
              SUSPECT DOSSIER
            </span>
          </div>
          <h1 className="font-display text-[36px] leading-[44px] font-bold text-secondary text-stamp tracking-[0.15em] uppercase mb-2">
            SUSPECT BOARD
          </h1>
          <p className="font-body text-[14px] text-on-surface-variant/70 mb-4">
            Select exactly 4 suspects for the investigation. Choose wisely.
          </p>

          {/* Player Name Input */}
          <div className="mb-8 flex items-center gap-4">
            <label className="font-label text-[12px] font-semibold text-on-surface-variant tracking-[0.2em] uppercase">
              YOUR CODENAME:
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="chat-input w-64"
              placeholder="Detective"
            />
          </div>

          {/* Selection counter */}
          <div className="mb-6 flex items-center gap-4">
            <div className="font-label text-[12px] font-semibold tracking-[0.2em] uppercase">
              <span className={selectedChars.length === 4 ? 'text-secondary' : 'text-tertiary'}>
                {selectedChars.length}
              </span>
              <span className="text-on-surface-variant"> / 4 SELECTED</span>
            </div>
            {selectedChars.length === 4 && (
              <span className="text-secondary text-[12px] font-label font-semibold tracking-wider animate-pulse">
                ✓ READY
              </span>
            )}
          </div>

          {/* Character Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
            {characters.map((char, i) => {
              const isSelected = selectedChars.includes(char.name);
              const isLocked = selectedChars.length >= 4 && !isSelected;

              return (
                <div
                  key={char.name}
                  onClick={() => !isLocked && onToggle(char.name)}
                  className={`character-card ${isSelected ? 'selected' : ''} ${isLocked ? 'locked' : ''} 
                    bg-surface-container p-0 shadow-[4px_4px_0px_rgba(0,0,0,0.4)] animate-fade-in-up`}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  {/* Character Image */}
                  <div className="relative w-full aspect-[3/4] bg-surface-container-highest overflow-hidden">
                    <img
                      src={`/images/${char.image}`}
                      alt={char.name}
                      className="w-full h-full object-cover filter grayscale-[40%] contrast-[1.2]"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div
                      className="w-full h-full items-center justify-center bg-surface-container-highest hidden"
                    >
                      <span className="material-symbols-outlined text-on-surface-variant/30 text-5xl">
                        person
                      </span>
                    </div>
                    {/* Selection badge */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-8 h-8 bg-secondary flex items-center justify-center shadow-lg">
                        <span className="material-symbols-outlined text-on-secondary text-sm font-bold">check</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-headline text-[14px] font-bold text-on-surface tracking-[0.05em] uppercase mb-1 truncate">
                      {char.name}
                    </h3>
                    <p className="font-label text-[10px] font-semibold text-secondary tracking-[0.15em] uppercase mb-2">
                      {char.archetype}
                    </p>
                    <p className="font-body text-[12px] text-on-surface-variant/60 leading-tight line-clamp-2">
                      {char.traits}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Confirm Button */}
          <div className="flex justify-center">
            <button
              onClick={onConfirm}
              disabled={selectedChars.length !== 4 || isLoading}
              className={`dymo-button group relative px-12 py-4 font-label text-[12px] font-semibold uppercase tracking-widest
                transition-all duration-500 shadow-[4px_4px_0px_#000]
                ${selectedChars.length === 4
                  ? 'bg-surface-container-highest border-2 border-secondary text-secondary hover:text-on-tertiary-fixed-variant hover:border-on-tertiary-fixed-variant animate-pulse-glow'
                  : 'bg-surface-container border-2 border-outline-variant text-outline cursor-not-allowed'
                }`}
            >
              <span className="relative z-10">
                {isLoading ? 'ASSEMBLING CASE...' : 'CONFIRM SUSPECTS'}
              </span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
