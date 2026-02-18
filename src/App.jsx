import { useState, useCallback } from 'react';
import SetupScreen from './components/SetupScreen';
import GameScreen from './components/GameScreen';
import BackgroundEffects from './components/BackgroundEffects';

const PHASES = {
  SETUP: 'setup',
  PLAYING: 'playing',
};

export default function App() {
  const [phase, setPhase] = useState(PHASES.SETUP);
  const [players, setPlayers] = useState([]);
  const [scores, setScores] = useState({});
  const [questions, setQuestions] = useState(null);
  const [roundNumber, setRoundNumber] = useState(0);

  const handleStartGame = useCallback((playerNames, questionList) => {
    const initialScores = {};
    playerNames.forEach(name => { initialScores[name] = 0; });
    setPlayers(playerNames);
    setScores(initialScores);
    setQuestions(questionList);
    setRoundNumber(1);
    setPhase(PHASES.PLAYING);
  }, []);

  const handleUpdateScores = useCallback((newScores) => {
    setScores(newScores);
  }, []);

  const handleNextRound = useCallback(() => {
    setRoundNumber(prev => prev + 1);
  }, []);

  const handleBackToSetup = useCallback(() => {
    setPhase(PHASES.SETUP);
    setPlayers([]);
    setScores({});
    setRoundNumber(0);
  }, []);

  return (
    <div className="noise min-h-screen relative font-body" dir="rtl">
      <BackgroundEffects />
      <div className="relative z-10 min-h-screen">
        {phase === PHASES.SETUP && (
          <SetupScreen onStart={handleStartGame} />
        )}
        {phase === PHASES.PLAYING && (
          <GameScreen
            players={players}
            scores={scores}
            questions={questions}
            roundNumber={roundNumber}
            onUpdateScores={handleUpdateScores}
            onNextRound={handleNextRound}
            onBackToSetup={handleBackToSetup}
          />
        )}
      </div>
    </div>
  );
}
