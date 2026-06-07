import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import LandingPage from './pages/LandingPage';
import RulesPage from './pages/RulesPage';
import CharacterSelectPage from './pages/CharacterSelectPage';
import GamePage from './pages/GamePage';
import VotingPage from './pages/VotingPage';
import VoteResultPage from './pages/VoteResultPage';
import NightPhasePage from './pages/NightPhasePage';
import GameOverPage from './pages/GameOverPage';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
  const [page, setPage] = useState('landing');
  const [gameState, setGameState] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [selectedChars, setSelectedChars] = useState([]);
  const [playerName, setPlayerName] = useState('Detective');
  const [chatInput, setChatInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);
  const heartbeatRef = useRef(null);

  // ── Fetch character pool ──
  const fetchCharacters = async () => {
    try {
      const res = await axios.get(`${API_URL}/characters`);
      setCharacters(res.data.characters);
    } catch (err) {
      console.error('Failed to fetch characters:', err);
    }
  };

  // ── Fetch game state ──
  const fetchState = async () => {
    try {
      const res = await axios.get(`${API_URL}/game-state`);
      setGameState(res.data);
      return res.data;
    } catch (err) {
      console.error('Failed to fetch state:', err);
    }
  };

  // ── Start game ──
  const startGame = async () => {
    if (selectedChars.length !== 4) return;
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/start-game`, {
        selected_characters: selectedChars,
        player_name: playerName,
      });
      setGameState(res.data);
      setTimeLeft(60);
      setPage('game');
    } catch (err) {
      console.error('Failed to start game:', err);
    }
    setIsLoading(false);
  };

  // ── Send human message ──
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isLoading) return;
    const msg = chatInput;
    setChatInput('');
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/human-message`, { message: msg });
      setGameState(res.data);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
    setIsLoading(false);
  };

  // ── Start voting ──
  const startVoting = async () => {
    try {
      const res = await axios.post(`${API_URL}/start-voting`);
      setGameState(res.data);
      setPage('voting');
    } catch (err) {
      console.error('Failed to start voting:', err);
    }
  };

  // ── Submit vote ──
  const submitVote = async (playerId) => {
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/submit-vote`, { voted_for_id: playerId });
      setGameState(res.data);
      if (res.data.winner) {
        setPage('game_over');
      } else {
        setPage('vote_result');
      }
    } catch (err) {
      console.error('Failed to submit vote:', err);
    }
    setIsLoading(false);
  };

  // ── Run night phase ──
  const runNight = async () => {
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/run-night`);
      setGameState(res.data);
      if (res.data.winner) {
        setPage('game_over');
      } else {
        setPage('game');
        setTimeLeft(60);
      }
    } catch (err) {
      console.error('Failed to run night:', err);
    }
    setIsLoading(false);
  };

  // ── Reset game ──
  const resetGame = async () => {
    try {
      await axios.post(`${API_URL}/reset`);
      setGameState(null);
      setSelectedChars([]);
      setPage('landing');
      setTimeLeft(60);
    } catch (err) {
      console.error('Failed to reset:', err);
    }
  };

  // ── Day Timer Countdown ──
  useEffect(() => {
    if (page !== 'game' || !gameState || gameState.phase !== 'day') return;
    if (timeLeft <= 0) {
      startVoting();
      return;
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, page, gameState?.phase]);

  // ── AI Heartbeat (every 8s during day) ──
  useEffect(() => {
    if (page === 'game' && gameState?.phase === 'day') {
      heartbeatRef.current = setInterval(async () => {
        try {
          const res = await axios.post(`${API_URL}/ai-heartbeat`);
          setGameState(res.data);
        } catch (err) {
          console.error('Heartbeat error:', err);
        }
      }, 8000);
    }
    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, [page, gameState?.phase]);

  // ── Auto-scroll chat ──
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [gameState?.chat_log]);

  // ── Character toggle ──
  const toggleCharacter = (name) => {
    setSelectedChars(prev => {
      if (prev.includes(name)) {
        return prev.filter(c => c !== name);
      }
      if (prev.length >= 4) return prev;
      return [...prev, name];
    });
  };

  // ── Derive useful info from game state ──
  const me = gameState?.players?.find(p => p.is_human);
  const alivePlayers = gameState?.players?.filter(p => p.is_alive) || [];
  const aliveAIs = alivePlayers.filter(p => !p.is_human);

  // ── Page Router ──
  switch (page) {
    case 'landing':
      return <LandingPage onStart={() => { fetchCharacters(); setPage('rules'); }} />;

    case 'rules':
      return <RulesPage onContinue={() => setPage('character_select')} />;

    case 'character_select':
      return (
        <CharacterSelectPage
          characters={characters}
          selectedChars={selectedChars}
          onToggle={toggleCharacter}
          onConfirm={startGame}
          playerName={playerName}
          setPlayerName={setPlayerName}
          isLoading={isLoading}
        />
      );

    case 'game':
      return (
        <GamePage
          gameState={gameState}
          me={me}
          chatInput={chatInput}
          setChatInput={setChatInput}
          onSendMessage={sendMessage}
          timeLeft={timeLeft}
          chatEndRef={chatEndRef}
          isLoading={isLoading}
        />
      );

    case 'voting':
      return (
        <VotingPage
          gameState={gameState}
          me={me}
          onVote={submitVote}
          isLoading={isLoading}
        />
      );

    case 'vote_result':
      return (
        <VoteResultPage
          gameState={gameState}
          onContinue={() => { setPage('night'); }}
        />
      );

    case 'night':
      return (
        <NightPhasePage
          gameState={gameState}
          me={me}
          onProceed={runNight}
          isLoading={isLoading}
        />
      );

    case 'game_over':
      return (
        <GameOverPage
          gameState={gameState}
          onRestart={resetGame}
        />
      );

    default:
      return <LandingPage onStart={() => setPage('rules')} />;
  }
}

export default App;
