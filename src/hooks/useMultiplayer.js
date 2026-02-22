import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '../firebase';
import {
  doc,
  collection,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  deleteDoc,
  serverTimestamp,
  arrayUnion,
  deleteField,
} from 'firebase/firestore';

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function generatePlayerId() {
  return 'p_' + Math.random().toString(36).substring(2, 10);
}

export function useMultiplayer() {
  const [roomCode, setRoomCode] = useState(null);
  const [playerId] = useState(() => {
    const stored = sessionStorage.getItem('telepaty_pid');
    if (stored) return stored;
    const id = generatePlayerId();
    sessionStorage.setItem('telepaty_pid', id);
    return id;
  });
  const [playerName, setPlayerName] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [gameState, setGameState] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const unsubRef = useRef(null);

  // Clean up listener on unmount
  useEffect(() => {
    return () => {
      if (unsubRef.current) unsubRef.current();
    };
  }, []);

  // Subscribe to room changes
  const subscribeToRoom = useCallback((code) => {
    if (unsubRef.current) unsubRef.current();

    const roomRef = doc(db, 'rooms', code);
    const unsub = onSnapshot(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        setGameState(snapshot.data());
      } else {
        setGameState(null);
        setError('اتاق حذف شده است');
      }
    }, (err) => {
      console.error('Firestore listener error:', err);
      setError('خطا در اتصال');
    });

    unsubRef.current = unsub;
  }, []);

  // Create a new room
  const createRoom = useCallback(async (hostName, questions) => {
    setLoading(true);
    setError('');
    try {
      let code = generateRoomCode();
      // Make sure code doesn't exist
      let exists = true;
      let attempts = 0;
      while (exists && attempts < 5) {
        const snap = await getDoc(doc(db, 'rooms', code));
        if (!snap.exists()) {
          exists = false;
        } else {
          code = generateRoomCode();
          attempts++;
        }
      }

      const roomData = {
        code,
        hostId: playerId,
        phase: 'lobby', // lobby | question | answering | reveal
        round: 0,
        currentQuestion: '',
        usedQuestions: [],
        questions: questions,
        players: {
          [playerId]: {
            name: hostName,
            score: 0,
            joinedAt: Date.now(),
          }
        },
        answers: {},
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'rooms', code), roomData);
      setRoomCode(code);
      setPlayerName(hostName);
      setIsHost(true);
      subscribeToRoom(code);
      setLoading(false);
      return code;
    } catch (err) {
      console.error('Create room error:', err);
      setError('خطا در ساخت اتاق');
      setLoading(false);
      return null;
    }
  }, [playerId, subscribeToRoom]);

  // Join existing room
  const joinRoom = useCallback(async (code, name) => {
    setLoading(true);
    setError('');
    try {
      const upperCode = code.toUpperCase().trim();
      const roomRef = doc(db, 'rooms', upperCode);
      const snap = await getDoc(roomRef);

      if (!snap.exists()) {
        setError('اتاق پیدا نشد');
        setLoading(false);
        return false;
      }

      const data = snap.data();

      // Check if game already started
      if (data.phase !== 'lobby') {
        setError('بازی شروع شده، نمی‌توانید وارد شوید');
        setLoading(false);
        return false;
      }

      // Check player count
      const playerCount = Object.keys(data.players || {}).length;
      if (playerCount >= 10) {
        setError('اتاق پر است (حداکثر ۱۰ نفر)');
        setLoading(false);
        return false;
      }

      // Check duplicate names
      const existingNames = Object.values(data.players || {}).map(p => p.name);
      if (existingNames.includes(name)) {
        setError('این اسم قبلاً استفاده شده');
        setLoading(false);
        return false;
      }

      // Add player to room
      await updateDoc(roomRef, {
        [`players.${playerId}`]: {
          name: name,
          score: 0,
          joinedAt: Date.now(),
        }
      });

      setRoomCode(upperCode);
      setPlayerName(name);
      setIsHost(data.hostId === playerId);
      subscribeToRoom(upperCode);
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Join room error:', err);
      setError('خطا در ورود به اتاق');
      setLoading(false);
      return false;
    }
  }, [playerId, subscribeToRoom]);

  // Start a new round (host only)
  const startRound = useCallback(async () => {
    if (!roomCode || !gameState) return;
    setError('');

    try {
      const roomRef = doc(db, 'rooms', roomCode);
      const qs = gameState.questions || [];
      const used = gameState.usedQuestions || [];

      let available = qs.filter(q => !used.includes(q));
      if (available.length === 0) {
        available = [...qs];
        // Reset used questions
        await updateDoc(roomRef, { usedQuestions: [] });
      }

      const question = available[Math.floor(Math.random() * available.length)];

      await updateDoc(roomRef, {
        phase: 'answering',
        round: (gameState.round || 0) + 1,
        currentQuestion: question,
        usedQuestions: arrayUnion(question),
        answers: {},
      });
    } catch (err) {
      console.error('Start round error:', err);
      setError('خطا در شروع راند');
    }
  }, [roomCode, gameState]);

  // Submit an answer
  const submitAnswer = useCallback(async (answer) => {
    if (!roomCode) return;
    setError('');

    try {
      const roomRef = doc(db, 'rooms', roomCode);
      await updateDoc(roomRef, {
        [`answers.${playerId}`]: answer.trim(),
      });
    } catch (err) {
      console.error('Submit answer error:', err);
      setError('خطا در ثبت جواب');
    }
  }, [roomCode, playerId]);

  // Reveal answers and calculate scores (host only)
  const revealAnswers = useCallback(async () => {
    if (!roomCode || !gameState) return;
    setError('');

    try {
      const roomRef = doc(db, 'rooms', roomCode);
      const answers = gameState.answers || {};
      const players = gameState.players || {};

      // Find majority
      const freq = {};
      const normalized = {};
      Object.entries(answers).forEach(([pid, answer]) => {
        const norm = answer.trim().toLowerCase().replace(/\s+/g, ' ');
        normalized[pid] = norm;
        freq[norm] = (freq[norm] || 0) + 1;
      });

      const maxCount = Math.max(...Object.values(freq), 0);
      const topAnswers = Object.keys(freq).filter(a => freq[a] === maxCount);
      const hasMajority = maxCount >= 2 && topAnswers.length === 1;

      // Update scores
      const updatedPlayers = { ...players };
      if (hasMajority) {
        const majorityAnswer = topAnswers[0];
        Object.entries(normalized).forEach(([pid, norm]) => {
          if (norm === majorityAnswer && updatedPlayers[pid]) {
            updatedPlayers[pid] = {
              ...updatedPlayers[pid],
              score: (updatedPlayers[pid].score || 0) + 1,
            };
          }
        });
      }

      await updateDoc(roomRef, {
        phase: 'reveal',
        players: updatedPlayers,
      });
    } catch (err) {
      console.error('Reveal error:', err);
      setError('خطا در نمایش نتایج');
    }
  }, [roomCode, gameState]);

  // Go back to lobby / next round ready
  const nextRound = useCallback(async () => {
    if (!roomCode) return;
    try {
      const roomRef = doc(db, 'rooms', roomCode);
      await updateDoc(roomRef, {
        phase: 'waiting',
        answers: {},
        currentQuestion: '',
      });
    } catch (err) {
      console.error('Next round error:', err);
    }
  }, [roomCode]);

  // Leave room
  const leaveRoom = useCallback(async () => {
    if (!roomCode) return;
    try {
      const roomRef = doc(db, 'rooms', roomCode);

      if (isHost) {
        // Host leaves = delete room
        await deleteDoc(roomRef);
      } else {
        // Remove player
        await updateDoc(roomRef, {
          [`players.${playerId}`]: deleteField(),
          [`answers.${playerId}`]: deleteField(),
        });
      }

      if (unsubRef.current) unsubRef.current();
      setRoomCode(null);
      setGameState(null);
      setIsHost(false);
    } catch (err) {
      console.error('Leave room error:', err);
    }
  }, [roomCode, isHost, playerId]);

  // Derived state
  const playersList = gameState
    ? Object.entries(gameState.players || {}).map(([id, data]) => ({
        id,
        name: data.name,
        score: data.score || 0,
        isHost: id === gameState.hostId,
      })).sort((a, b) => a.joinedAt - b.joinedAt)
    : [];

  const myAnswer = gameState?.answers?.[playerId] || null;
  const allAnswered = gameState
    ? Object.keys(gameState.players || {}).length > 0 &&
      Object.keys(gameState.players || {}).every(pid => gameState.answers?.[pid])
    : false;
  const answeredCount = gameState ? Object.keys(gameState.answers || {}).length : 0;
  const totalPlayers = playersList.length;

  return {
    // State
    roomCode,
    playerId,
    playerName,
    isHost,
    gameState,
    error,
    loading,
    playersList,
    myAnswer,
    allAnswered,
    answeredCount,
    totalPlayers,

    // Actions
    createRoom,
    joinRoom,
    startRound,
    submitAnswer,
    revealAnswers,
    nextRound,
    leaveRoom,
    setError,
  };
}
