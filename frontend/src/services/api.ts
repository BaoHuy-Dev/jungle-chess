import type { GameStateData } from '../store/gameStore';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/**
 * Helper to make authenticated requests.
 */
function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const token = localStorage.getItem('auth_token');
    const headers: Record<string, string> = {
        ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return fetch(url, { ...options, headers });
}

export const api = {
    async createLocalGame(): Promise<GameStateData> {
        const res = await authFetch(`${API_BASE}/api/game/local`, { method: 'POST' });
        if (!res.ok) throw new Error('Failed to create game');
        return res.json();
    },

    async createAIGame(difficulty: string = 'medium', playerId?: string): Promise<GameStateData> {
        const res = await authFetch(`${API_BASE}/api/game/ai`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playerId, difficulty }),
        });
        if (!res.ok) throw new Error('Failed to create AI game');
        return res.json();
    },

    async createOnlineGame(playerId?: string): Promise<GameStateData> {
        const res = await authFetch(`${API_BASE}/api/game/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playerId }),
        });
        if (!res.ok) throw new Error('Failed to create game');
        return res.json();
    },

    async joinGame(gameId: string, playerId?: string): Promise<GameStateData> {
        const res = await authFetch(`${API_BASE}/api/game/join/${gameId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playerId }),
        });
        if (!res.ok) throw new Error('Failed to join game');
        return res.json();
    },

    async getGameState(gameId: string): Promise<GameStateData> {
        const res = await authFetch(`${API_BASE}/api/game/${gameId}`);
        if (!res.ok) throw new Error('Failed to get game state');
        return res.json();
    },

    async getValidMoves(gameId: string, row: number, col: number): Promise<{ row: number; col: number; validMoves: number[][] }> {
        const res = await authFetch(`${API_BASE}/api/game/${gameId}/moves?row=${row}&col=${col}`);
        if (!res.ok) throw new Error('Failed to get valid moves');
        return res.json();
    },

    async makeMove(gameId: string, fromRow: number, fromCol: number, toRow: number, toCol: number): Promise<GameStateData> {
        const res = await authFetch(`${API_BASE}/api/game/${gameId}/move`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gameId, fromRow, fromCol, toRow, toCol }),
        });
        if (!res.ok) throw new Error('Invalid move');
        return res.json();
    },

    async listGames(): Promise<GameStateData[]> {
        const res = await authFetch(`${API_BASE}/api/game/list`);
        if (!res.ok) throw new Error('Failed to list games');
        return res.json();
    },
};

export const authApi = {
    async me() {
        const res = await authFetch(`${API_BASE}/api/auth/me`);
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
    },

    async logout() {
        await authFetch(`${API_BASE}/api/auth/logout`, { method: 'POST' });
    },
};
