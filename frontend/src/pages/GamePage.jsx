import { getCharacterImage } from '../utils';

export default function GamePage({
  gameState,
  me,
  chatInput,
  setChatInput,
  onSendMessage,
  timeLeft,
  chatEndRef,
  isLoading,
}) {
  if (!gameState) return null;

  const alivePlayers = gameState.players.filter(p => p.is_alive);
  const deadPlayers = gameState.eliminated_players || [];

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative h-screen w-full bg-surface overflow-hidden flex flex-col">
      {/* Grain & Vignette */}
      <div className="absolute inset-0 z-10 grain pointer-events-none" />
      <div className="absolute inset-0 z-20 vignette pointer-events-none" />

      {/* Top Bar */}
      <header className="relative z-30 flex items-center justify-between px-8 py-4 border-b border-outline-variant/30 bg-surface-container/80 backdrop-blur-sm">
        <div className="flex items-center gap-6">
          <div className="font-label text-[12px] font-semibold text-on-surface-variant tracking-[0.2em] uppercase">
            ROUND {gameState.round_number}
          </div>
          <div className="w-px h-6 bg-outline-variant" />
          <div className="font-label text-[12px] font-semibold text-secondary tracking-[0.2em] uppercase flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">wb_sunny</span>
            DAY PHASE
          </div>
        </div>

        {/* Timer */}
        <div className={`font-display text-[24px] font-bold tracking-[0.1em] ${timeLeft <= 10 ? 'text-tertiary animate-pulse' : 'text-secondary'}`}>
          {formatTime(timeLeft)}
        </div>

        {/* Role badge (private) */}
        {me && (
          <div className={`font-label text-[10px] font-semibold tracking-[0.2em] uppercase px-3 py-1 border
            ${me.role === 'traitor'
              ? 'text-tertiary border-tertiary/40 bg-tertiary/10'
              : 'text-primary border-primary/40 bg-primary/10'
            }`}
          >
            YOUR ROLE: {me.role.toUpperCase()}
          </div>
        )}
      </header>

      {/* Main 3-Column Layout */}
      <div className="relative z-30 flex-1 grid grid-cols-[240px_1fr_240px] gap-0 overflow-hidden">

        {/* Left: Player Panel */}
        <aside className="border-r border-outline-variant/30 bg-surface-container-low/50 p-4 overflow-y-auto">
          <h2 className="font-label text-[10px] font-semibold text-on-surface-variant tracking-[0.2em] uppercase mb-4">
            ACTIVE SUSPECTS
          </h2>
          <div className="space-y-3">
            {alivePlayers.map((p) => (
              <div
                key={p.player_id}
                className={`flex items-center gap-3 p-3 border border-outline-variant/20 bg-surface-container
                  ${p.is_human ? 'border-l-2 border-l-secondary' : ''}`}
              >
                <div className="w-10 h-10 bg-surface-container-highest flex items-center justify-center shrink-0 overflow-hidden">
                  {!p.is_human ? (
                    <img
                      src={getCharacterImage(p.character_name)}
                      alt={p.character_name}
                      className="w-full h-full object-cover filter grayscale-[30%]"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <span className="material-symbols-outlined text-secondary text-lg">person</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-body text-[13px] text-on-surface truncate">
                    {p.character_name}
                    {p.is_human && <span className="text-secondary ml-1">(You)</span>}
                  </p>
                  <p className="font-label text-[9px] text-on-surface-variant/50 tracking-wider uppercase">
                    {p.is_human ? 'PLAYER' : 'SUSPECT'}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Eliminated */}
          {deadPlayers.length > 0 && (
            <>
              <h2 className="font-label text-[10px] font-semibold text-tertiary/70 tracking-[0.2em] uppercase mt-6 mb-3">
                ELIMINATED
              </h2>
              <div className="space-y-2">
                {deadPlayers.map((p) => (
                  <div key={p.player_id} className="flex items-center gap-3 p-2 opacity-50">
                    <div className="w-8 h-8 bg-surface-container-highest flex items-center justify-center">
                      <span className="material-symbols-outlined text-tertiary/50 text-sm">close</span>
                    </div>
                    <div>
                      <p className="font-body text-[12px] text-on-surface-variant line-through">{p.character_name}</p>
                      <p className="font-label text-[9px] text-tertiary/60 tracking-wider uppercase">
                        {p.role} — {p.reason === 'voted_out' ? 'BANISHED' : 'NIGHT KILL'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </aside>

        {/* Center: Chat Window */}
        <div className="flex flex-col bg-surface-container-lowest/30">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {gameState.chat_log.map((msg, i) => {
              const isSystem = msg.sender === 'SYSTEM';
              const isMe = msg.sender === me?.character_name;

              return (
                <div
                  key={i}
                  className={`animate-fade-in-up ${isSystem ? 'text-center' : ''}`}
                  style={{ animationDelay: `${Math.min(i * 0.02, 0.5)}s` }}
                >
                  {isSystem ? (
                    <p className="font-label text-[11px] font-semibold text-secondary/70 tracking-[0.15em] uppercase py-2">
                      {msg.message}
                    </p>
                  ) : (
                    <div className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                      <div className={`max-w-[70%] p-3 border
                        ${isMe
                          ? 'bg-surface-container-high border-secondary/30 ml-auto'
                          : 'bg-surface-container border-outline-variant/20'
                        }`}
                      >
                        <p className={`font-label text-[10px] font-semibold tracking-[0.15em] uppercase mb-1
                          ${isMe ? 'text-secondary' : 'text-on-surface-variant/70'}`}
                        >
                          {msg.sender}
                        </p>
                        <p className="font-body text-[14px] text-on-surface leading-relaxed">
                          {msg.message}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          {me?.is_alive && gameState.phase === 'day' && (
            <form onSubmit={onSendMessage} className="p-4 border-t border-outline-variant/30 flex gap-3">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type your message, Detective..."
                className="chat-input flex-1"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isLoading}
                className="dymo-button px-6 py-3 bg-surface-container-highest border border-secondary text-secondary font-label text-[11px] font-semibold uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed hover:bg-secondary/10 transition-colors"
              >
                SEND
              </button>
            </form>
          )}
        </div>

        {/* Right: Phase Info Panel */}
        <aside className="border-l border-outline-variant/30 bg-surface-container-low/50 p-4 overflow-y-auto">
          <h2 className="font-label text-[10px] font-semibold text-on-surface-variant tracking-[0.2em] uppercase mb-4">
            CASE STATUS
          </h2>

          <div className="space-y-4">
            <div className="bg-surface-container border border-outline-variant/20 p-4">
              <p className="font-label text-[9px] text-on-surface-variant/50 tracking-wider uppercase mb-1">PHASE</p>
              <p className="font-body text-[16px] text-secondary font-bold uppercase tracking-wider">
                {gameState.phase}
              </p>
            </div>

            <div className="bg-surface-container border border-outline-variant/20 p-4">
              <p className="font-label text-[9px] text-on-surface-variant/50 tracking-wider uppercase mb-1">ALIVE</p>
              <p className="font-display text-[24px] text-on-surface font-bold">
                {alivePlayers.length} <span className="text-[14px] text-on-surface-variant/50">/ {gameState.players.length}</span>
              </p>
            </div>

            <div className="bg-surface-container border border-outline-variant/20 p-4">
              <p className="font-label text-[9px] text-on-surface-variant/50 tracking-wider uppercase mb-1">TIME LEFT</p>
              <p className={`font-display text-[24px] font-bold tracking-wider ${timeLeft <= 10 ? 'text-tertiary' : 'text-secondary'}`}>
                {formatTime(timeLeft)}
              </p>
            </div>

            {me?.role === 'traitor' && (
              <div className="bg-tertiary-container border border-tertiary/30 p-4">
                <p className="font-label text-[9px] text-tertiary tracking-wider uppercase mb-1 font-semibold">⚠ SECRET</p>
                <p className="font-body text-[12px] text-tertiary leading-relaxed">
                  You are the Deceiver. Deflect suspicion. Blend in. Survive.
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
