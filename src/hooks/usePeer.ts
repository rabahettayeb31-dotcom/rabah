/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import Peer, { DataConnection, MediaConnection } from 'peerjs';

export interface Player {
  name: string;
  peerId: string;
  isHost: boolean;
  stream?: MediaStream;
}

export function usePeer() {
  const [peer, setPeer] = useState<Peer | null>(null);
  const [roomCode, setRoomCode] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [connections, setConnections] = useState<DataConnection[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [myStream, setMyStream] = useState<MediaStream | null>(null);
  const [isMicMuted, setIsMicMuted] = useState(true);

  const localStreamRef = useRef<MediaStream | null>(null);
  const connectionsRef = useRef<DataConnection[]>([]);
  const playersRef = useRef<Player[]>([]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (peer) peer.destroy();
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, [peer]);

  const initVoice = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      setMyStream(stream);
      // default muted
      stream.getAudioTracks().forEach(t => (t.enabled = false));
      setIsMicMuted(true);
      return stream;
    } catch (err) {
      console.error("Microphone access denied", err);
      return null;
    }
  };

  const toggleMic = () => {
    if (localStreamRef.current) {
      const newState = !isMicMuted;
      localStreamRef.current.getAudioTracks().forEach(t => (t.enabled = newState));
      setIsMicMuted(newState);
    }
  };

  const createRoom = useCallback(async (playerName: string) => {
    setIsLoading(true);
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newPeer = new Peer(`chkoun-${code}-${Date.now()}`, {
      debug: 1,
      config: {
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      }
    });

    const stream = await initVoice();

    newPeer.on('open', (id) => {
      setPeer(newPeer);
      setRoomCode(code);
      setIsHost(true);
      const hostPlayer = { name: playerName, peerId: id, isHost: true };
      setPlayers([hostPlayer]);
      playersRef.current = [hostPlayer];
      setIsLoading(false);
    });

    newPeer.on('connection', (conn) => {
      conn.on('open', () => {
        connectionsRef.current.push(conn);
        setConnections([...connectionsRef.current]);

        conn.on('data', (data: any) => {
          if (data.type === 'JOIN') {
            const newPlayer = { name: data.name, peerId: data.peerId, isHost: false };
            playersRef.current.push(newPlayer);
            setPlayers([...playersRef.current]);
            
            // Sync players to all
            connectionsRef.current.forEach(c => {
              c.send({ type: 'ROOM_UPDATE', players: playersRef.current });
            });

            // Call the newcomer if we have a stream
            if (localStreamRef.current) {
              newPeer.call(data.peerId, localStreamRef.current);
            }
          }
        });
      });
    });

    // Handle incoming calls (voice chat)
    newPeer.on('call', (call) => {
      call.answer(localStreamRef.current || undefined);
      call.on('stream', (remoteStream) => {
        // Find player and attach stream
        setPlayers(prev => prev.map(p => 
          p.peerId === call.peer ? { ...p, stream: remoteStream } : p
        ));

        // Auto-play the audio
        const audio = new Audio();
        audio.srcObject = remoteStream;
        audio.play().catch(e => console.error("Audio play blocked", e));
      });
    });

    newPeer.on('error', (err) => {
      console.error(err);
      setIsLoading(false);
    });
  }, []);

  const joinRoom = useCallback(async (code: string, playerName: string) => {
    setIsLoading(true);
    const newPeer = new Peer(null, {
      debug: 1,
      config: {
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      }
    });

    const stream = await initVoice();

    newPeer.on('open', (id) => {
      const conn = newPeer.connect(`chkoun-${code.toUpperCase()}`);
      
      conn.on('open', () => {
        setPeer(newPeer);
        setRoomCode(code.toUpperCase());
        setIsHost(false);
        conn.send({ type: 'JOIN', name: playerName, peerId: id });
        setIsLoading(false);
      });

      conn.on('data', (data: any) => {
        if (data.type === 'ROOM_UPDATE') {
          setPlayers(data.players);
          playersRef.current = data.players;
        }
      });
      
      conn.on('close', () => {
        alert("انقطع الاتصال بالغرفة");
        window.location.reload();
      });
    });

    newPeer.on('call', (call) => {
      call.answer(localStreamRef.current || undefined);
      call.on('stream', (remoteStream) => {
        setPlayers(prev => prev.map(p => 
          p.peerId === call.peer ? { ...p, stream: remoteStream } : p
        ));
      });
    });

    newPeer.on('error', (err) => {
      console.error(err);
      setIsLoading(false);
    });
  }, []);

  const broadcast = (data: any) => {
    connectionsRef.current.forEach(c => {
      if (c.open) c.send(data);
    });
  };

  const setQuestion = (q: any) => {
    if (isHost) {
      broadcast({ type: 'QUESTION_UPDATE', question: q });
    }
  };

  const sendVote = (player: string) => {
    if (isHost) {
      broadcast({ type: 'VOTE', player });
    } else {
      connectionsRef.current.forEach(c => c.send({ type: 'VOTE', player }));
    }
  };

  return {
    peer,
    roomCode,
    isHost,
    players,
    isLoading,
    createRoom,
    joinRoom,
    broadcast,
    isMicMuted,
    toggleMic,
    setQuestion,
    sendVote
  };
}
