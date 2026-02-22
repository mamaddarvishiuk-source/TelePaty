import { useMultiplayer } from './hooks/useMultiplayer';
import HomeScreen from './components/HomeScreen';
import LobbyScreen from './components/LobbyScreen';
import MultiplayerGame from './components/MultiplayerGame';
import BackgroundEffects from './components/BackgroundEffects';

export default function App() {
  const multiplayer = useMultiplayer();

  const phase = multiplayer.gameState?.phase;
  const inRoom = !!multiplayer.roomCode && !!multiplayer.gameState;

  return (
    <div className="noise min-h-screen relative font-body" dir="rtl">
      <BackgroundEffects />
      <div className="relative z-10 min-h-screen">
        {!inRoom && (
          <HomeScreen multiplayer={multiplayer} />
        )}
        {inRoom && phase === 'lobby' && (
          <LobbyScreen multiplayer={multiplayer} />
        )}
        {inRoom && (phase === 'answering' || phase === 'reveal' || phase === 'waiting') && (
          <MultiplayerGame multiplayer={multiplayer} />
        )}
      </div>
    </div>
  );
}
