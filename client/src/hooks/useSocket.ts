import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { ClientGameState, ChatMessage } from '../types/index.js';

const SOCKET_SERVER_URL =
  import.meta.env.VITE_SERVER_URL ||
  (typeof window !== 'undefined' ? `http://${window.location.hostname}:3001` : 'http://localhost:3001');

const STORAGE_KEYS = {
  ROOM_ID: 'kachuful_room_id',
  SESSION_TOKEN: 'kachuful_session_token',
  PLAYER_NAME: 'kachuful_player_name',
};

export function useSocket(onSound?: (sound: any) => void) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [gameState, setGameState] = useState<ClientGameState | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sessionInfo, setSessionInfo] = useState<{ roomId: string; sessionToken: string; playerId: string } | null>(() => {
    const roomId = localStorage.getItem(STORAGE_KEYS.ROOM_ID);
    const sessionToken = localStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
    if (roomId && sessionToken) {
      return { roomId, sessionToken, playerId: '' };
    }
    return null;
  });

  const clearError = useCallback(() => setErrorMessage(null), []);

  useEffect(() => {
    const socket = io(SOCKET_SERVER_URL, {
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Client Socket] Connected:', socket.id);
      setConnected(true);

      // Auto-reconnect if session token exists in local storage
      const savedRoomId = localStorage.getItem(STORAGE_KEYS.ROOM_ID);
      const savedToken = localStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
      if (savedRoomId && savedToken) {
        socket.emit('reconnectSeat', { roomId: savedRoomId, sessionToken: savedToken }, (res: any) => {
          if (!res?.success) {
            // Token expired or invalid room, clear storage
            localStorage.removeItem(STORAGE_KEYS.ROOM_ID);
            localStorage.removeItem(STORAGE_KEYS.SESSION_TOKEN);
            setSessionInfo(null);
          }
        });
      }
    });

    socket.on('disconnect', () => {
      console.log('[Client Socket] Disconnected');
      setConnected(false);
    });

    socket.on('roomCreated', (data: { roomId: string; sessionToken: string; playerId: string }) => {
      localStorage.setItem(STORAGE_KEYS.ROOM_ID, data.roomId);
      localStorage.setItem(STORAGE_KEYS.SESSION_TOKEN, data.sessionToken);
      setSessionInfo(data);
    });

    socket.on('roomJoined', (data: { roomId: string; sessionToken: string; playerId: string }) => {
      localStorage.setItem(STORAGE_KEYS.ROOM_ID, data.roomId);
      localStorage.setItem(STORAGE_KEYS.SESSION_TOKEN, data.sessionToken);
      setSessionInfo(data);
    });

    socket.on('gameStateUpdated', (state: ClientGameState) => {
      setGameState(state);
    });

    socket.on('soundTrigger', (soundType: any) => {
      if (onSound) {
        onSound(soundType);
      }
    });

    socket.on('chatMessage', (msg: ChatMessage) => {
      setChatMessages((prev) => [...prev.slice(-49), msg]);
    });

    socket.on('errorNotification', (msg: string) => {
      setErrorMessage(msg);
      setTimeout(() => {
        setErrorMessage((cur) => (cur === msg ? null : cur));
      }, 5000);
    });

    return () => {
      socket.disconnect();
    };
  }, [onSound]);

  const createRoom = useCallback((playerName: string, customMaxCards?: number) => {
    localStorage.setItem(STORAGE_KEYS.PLAYER_NAME, playerName);
    socketRef.current?.emit('createRoom', { playerName, customMaxCards }, (res: any) => {
      if (!res?.success && res?.error) {
        setErrorMessage(res.error);
      }
    });
  }, []);

  const joinRoom = useCallback((roomId: string, playerName: string) => {
    localStorage.setItem(STORAGE_KEYS.PLAYER_NAME, playerName);
    const existingToken = localStorage.getItem(STORAGE_KEYS.SESSION_TOKEN) || undefined;
    socketRef.current?.emit('joinRoom', { roomId, playerName, sessionToken: existingToken }, (res: any) => {
      if (!res?.success && res?.error) {
        setErrorMessage(res.error);
      }
    });
  }, []);

  const transferSeat = useCallback((transferCode: string) => {
    socketRef.current?.emit('transferSeat', { transferCode }, (res: any) => {
      if (!res?.success && res?.error) {
        setErrorMessage(res.error);
      }
    });
  }, []);

  const leaveRoom = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.ROOM_ID);
    localStorage.removeItem(STORAGE_KEYS.SESSION_TOKEN);
    setSessionInfo(null);
    setGameState(null);
    window.location.reload();
  }, []);

  const startGame = useCallback(() => {
    socketRef.current?.emit('startGame');
  }, []);

  const addBot = useCallback(() => {
    socketRef.current?.emit('addBot', (res: any) => {
      if (!res?.success && res?.error) {
        setErrorMessage(res.error);
      }
    });
  }, []);

  const removeBot = useCallback((botId: string) => {
    socketRef.current?.emit('removeBot', botId);
  }, []);

  const kickPlayer = useCallback((playerId: string) => {
    socketRef.current?.emit('kickPlayer', playerId);
  }, []);

  const makeBid = useCallback((bid: number) => {
    socketRef.current?.emit('makeBid', bid);
  }, []);

  const playCard = useCallback((cardId: string) => {
    socketRef.current?.emit('playCard', cardId);
  }, []);

  const nextRound = useCallback(() => {
    socketRef.current?.emit('nextRound');
  }, []);

  const restartGame = useCallback(() => {
    socketRef.current?.emit('restartGame');
  }, []);

  const sendChat = useCallback((text: string) => {
    if (!text.trim()) return;
    socketRef.current?.emit('sendChat', text.trim());
  }, []);

  return {
    connected,
    gameState,
    sessionInfo,
    chatMessages,
    errorMessage,
    clearError,
    createRoom,
    joinRoom,
    transferSeat,
    leaveRoom,
    startGame,
    addBot,
    removeBot,
    kickPlayer,
    makeBid,
    playCard,
    nextRound,
    restartGame,
    sendChat,
  };
}
