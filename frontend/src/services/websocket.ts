import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { GameStateData } from '../store/gameStore';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const WS_URL = API_BASE.replace(/^http/, 'ws') + '/ws';

let stompClient: Client | null = null;

export const websocket = {
    connect(gameId: string, onGameUpdate: (state: GameStateData) => void): Promise<void> {
        return new Promise((resolve, reject) => {
            stompClient = new Client({
                webSocketFactory: () => new SockJS(WS_URL) as any,
                reconnectDelay: 5000,
                onConnect: () => {
                    console.log('WebSocket connected');
                    stompClient?.subscribe(`/topic/game/${gameId}`, (message) => {
                        const gameState: GameStateData = JSON.parse(message.body);
                        onGameUpdate(gameState);
                    });
                    resolve();
                },
                onStompError: (frame) => {
                    console.error('STOMP error:', frame);
                    reject(new Error('WebSocket connection failed'));
                },
            });

            stompClient.activate();
        });
    },

    sendMove(gameId: string, playerId: string, fromRow: number, fromCol: number, toRow: number, toCol: number) {
        if (!stompClient?.connected) {
            console.error('WebSocket not connected');
            return;
        }

        stompClient.publish({
            destination: '/app/game.move',
            body: JSON.stringify({ gameId, playerId, fromRow, fromCol, toRow, toCol }),
        });
    },

    disconnect() {
        stompClient?.deactivate();
        stompClient = null;
    },
};
