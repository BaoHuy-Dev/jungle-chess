import { create } from 'zustand';

export interface PieceData {
  type: string;
  side: 'RED' | 'BLUE';
  row: number;
  col: number;
  alive: boolean;
  rank: number;
  name: string;
}

export interface GameStateData {
  gameId: string;
  status: 'WAITING' | 'PLAYING' | 'FINISHED';
  currentTurn: 'RED' | 'BLUE';
  winner: string | null;
  pieces: PieceData[];
  boardLayout: number[][];
  redPlayerId: string;
  bluePlayerId: string;
}

interface GameStore {
  // Game state
  gameState: GameStateData | null;
  selectedPiece: { row: number; col: number } | null;
  validMoves: number[][];
  isLoading: boolean;
  error: string | null;
  isAIGame: boolean;
  aiDifficulty: string;

  // Actions
  setGameState: (state: GameStateData) => void;
  selectPiece: (row: number, col: number, validMoves: number[][]) => void;
  clearSelection: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetGame: () => void;
  setAIGame: (isAI: boolean, difficulty: string) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  gameState: null,
  selectedPiece: null,
  validMoves: [],
  isLoading: false,
  error: null,
  isAIGame: false,
  aiDifficulty: 'medium',

  setGameState: (state) => set({ gameState: state, error: null }),
  selectPiece: (row, col, validMoves) => set({ selectedPiece: { row, col }, validMoves }),
  clearSelection: () => set({ selectedPiece: null, validMoves: [] }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  resetGame: () => set({ gameState: null, selectedPiece: null, validMoves: [], error: null, isAIGame: false }),
  setAIGame: (isAI, difficulty) => set({ isAIGame: isAI, aiDifficulty: difficulty }),
}));

// UI Store
interface UIStore {
  currentPage: 'menu' | 'game' | 'lobby';
  showChat: boolean;
  soundEnabled: boolean;
  soundVolume: number;
  setPage: (page: 'menu' | 'game' | 'lobby') => void;
  toggleChat: () => void;
  toggleSound: () => void;
  setSoundVolume: (vol: number) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  currentPage: 'menu',
  showChat: false,
  soundEnabled: true,
  soundVolume: 0.5,
  setPage: (page) => set({ currentPage: page }),
  toggleChat: () => set((s) => ({ showChat: !s.showChat })),
  toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
  setSoundVolume: (vol) => set({ soundVolume: vol }),
}));
