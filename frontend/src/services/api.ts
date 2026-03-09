import type { GameStateData } from '../store/gameStore';

const API_BASE = 'http://localhost:8080/api/game';

export const api = {
    async createLocalGame(): Promise<GameStateData> {
        const res = await fetch(`${API_BASE}/local`, { method: 'POST' });
        if (!res.ok) throw new Error('Failed to create game');
        return res.json();
    },

    async createAIGame(difficulty: string = 'medium', playerId?: string): Promise<GameStateData> {
        const res = await fetch(`${API_BASE}/ai`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playerId, difficulty }),
        });
        if (!res.ok) throw new Error('Failed to create AI game');
        return res.json();
    },

    async createOnlineGame(playerId?: string): Promise<GameStateData> {
        const res = await fetch(`${API_BASE}/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playerId }),
        });
        if (!res.ok) throw new Error('Failed to create game');
        return res.json();
    },

    async joinGame(gameId: string, playerId?: string): Promise<GameStateData> {
        const res = await fetch(`${API_BASE}/join/${gameId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playerId }),
        });
        if (!res.ok) throw new Error('Failed to join game');
        return res.json();
    },

    async getGameState(gameId: string): Promise<GameStateData> {
        const res = await fetch(`${API_BASE}/${gameId}`);
        if (!res.ok) throw new Error('Failed to get game state');
        return res.json();
    },

    async getValidMoves(gameId: string, row: number, col: number): Promise<{ row: number; col: number; validMoves: number[][] }> {
        const res = await fetch(`${API_BASE}/${gameId}/moves?row=${row}&col=${col}`);
        if (!res.ok) throw new Error('Failed to get valid moves');
        return res.json();
    },

    async makeMove(gameId: string, fromRow: number, fromCol: number, toRow: number, toCol: number): Promise<GameStateData> {
        const res = await fetch(`${API_BASE}/${gameId}/move`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gameId, fromRow, fromCol, toRow, toCol }),
        });
        if (!res.ok) throw new Error('Invalid move');
        return res.json();
    },

    async listGames(): Promise<GameStateData[]> {
        const res = await fetch(`${API_BASE}/list`);
        if (!res.ok) throw new Error('Failed to list games');
        return res.json();
    },
};
