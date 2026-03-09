package com.cothu.engine;

import com.cothu.model.*;

import java.util.ArrayList;
import java.util.List;

/**
 * AI Engine using Minimax with Alpha-Beta pruning for Cờ Thú (Jungle Chess).
 */
public class AIEngine {

    /**
     * Get the best move for the AI player.
     * 
     * @param state      Current game state
     * @param difficulty "easy" (depth 2), "medium" (depth 4), "hard" (depth 6)
     * @return int[4] {fromRow, fromCol, toRow, toCol} or null if no moves
     */
    public static int[] getBestMove(GameState state, String difficulty) {
        int depth = switch (difficulty.toLowerCase()) {
            case "easy" -> 2;
            case "hard" -> 6;
            default -> 4; // medium
        };

        PlayerSide aiSide = state.getCurrentTurn();
        int[] bestMove = null;
        int bestScore = Integer.MIN_VALUE;

        List<int[]> allMoves = getAllMoves(state, aiSide);

        // Add some randomness for "easy" mode
        if ("easy".equalsIgnoreCase(difficulty) && !allMoves.isEmpty()) {
            // 30% chance of random move for easy mode
            if (Math.random() < 0.3) {
                return allMoves.get((int) (Math.random() * allMoves.size()));
            }
        }

        for (int[] move : allMoves) {
            GameState cloned = cloneState(state);
            GameEngine.makeMove(cloned, move[0], move[1], move[2], move[3]);

            int score = minimax(cloned, depth - 1, Integer.MIN_VALUE, Integer.MAX_VALUE, false, aiSide);

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        return bestMove;
    }

    /**
     * Minimax with alpha-beta pruning.
     */
    private static int minimax(GameState state, int depth, int alpha, int beta, boolean isMax, PlayerSide aiSide) {
        if (depth == 0 || state.getStatus() == GameState.GameStatus.FINISHED) {
            return evaluate(state, aiSide);
        }

        PlayerSide currentSide = isMax ? aiSide : getOpponent(aiSide);
        List<int[]> moves = getAllMoves(state, currentSide);

        if (moves.isEmpty()) {
            return evaluate(state, aiSide);
        }

        if (isMax) {
            int maxEval = Integer.MIN_VALUE;
            for (int[] move : moves) {
                GameState cloned = cloneState(state);
                GameEngine.makeMove(cloned, move[0], move[1], move[2], move[3]);
                int eval = minimax(cloned, depth - 1, alpha, beta, false, aiSide);
                maxEval = Math.max(maxEval, eval);
                alpha = Math.max(alpha, eval);
                if (beta <= alpha)
                    break;
            }
            return maxEval;
        } else {
            int minEval = Integer.MAX_VALUE;
            for (int[] move : moves) {
                GameState cloned = cloneState(state);
                GameEngine.makeMove(cloned, move[0], move[1], move[2], move[3]);
                int eval = minimax(cloned, depth - 1, alpha, beta, true, aiSide);
                minEval = Math.min(minEval, eval);
                beta = Math.min(beta, eval);
                if (beta <= alpha)
                    break;
            }
            return minEval;
        }
    }

    /**
     * Board evaluation function.
     */
    private static int evaluate(GameState state, PlayerSide aiSide) {
        PlayerSide opponent = getOpponent(aiSide);

        // Check win/loss
        if (state.getStatus() == GameState.GameStatus.FINISHED) {
            if (state.getWinner() == aiSide)
                return 10000;
            if (state.getWinner() == opponent)
                return -10000;
            return 0;
        }

        int score = 0;

        // Material advantage (weighted by rank)
        for (Piece p : state.getAlivePieces(aiSide)) {
            score += getMaterialValue(p);
        }
        for (Piece p : state.getAlivePieces(opponent)) {
            score -= getMaterialValue(p);
        }

        // Positional advantage - proximity to enemy den
        for (Piece p : state.getAlivePieces(aiSide)) {
            score += getPositionalValue(p, opponent);
        }
        for (Piece p : state.getAlivePieces(opponent)) {
            score -= getPositionalValue(p, aiSide);
        }

        // Trap control bonus
        score += getTrapControlBonus(state, aiSide);
        score -= getTrapControlBonus(state, opponent);

        // Piece count advantage
        int aiPieceCount = state.getAlivePieces(aiSide).size();
        int oppPieceCount = state.getAlivePieces(opponent).size();
        score += (aiPieceCount - oppPieceCount) * 15;

        return score;
    }

    /**
     * Material value based on rank with bonuses for powerful pieces.
     */
    private static int getMaterialValue(Piece piece) {
        int rank = piece.getAnimalType().getRank();
        return switch (rank) {
            case 1 -> 35; // Rat - special strategic value (can capture elephant)
            case 2 -> 20; // Cat
            case 3 -> 25; // Wolf
            case 4 -> 30; // Dog
            case 5 -> 40; // Leopard
            case 6 -> 55; // Tiger
            case 7 -> 60; // Lion
            case 8 -> 50; // Elephant (slightly less than lion due to rat weakness)
            default -> rank * 10;
        };
    }

    /**
     * Positional value - bonus for being close to enemy den.
     */
    private static int getPositionalValue(Piece piece, PlayerSide targetDenOwner) {
        int denRow = (targetDenOwner == PlayerSide.RED) ? 0 : 8;
        int denCol = 3;

        int distance = Math.abs(piece.getRow() - denRow) + Math.abs(piece.getCol() - denCol);

        // Higher rank pieces get more bonus for being close to den
        int proximityBonus = (14 - distance) * piece.getAnimalType().getRank() / 4;

        // Extra bonus for pieces very close to the den
        if (distance <= 2) {
            proximityBonus += 20;
        }
        if (distance <= 1) {
            proximityBonus += 30;
        }

        return proximityBonus;
    }

    /**
     * Bonus for having pieces near your own traps (defensive) and near enemy traps
     * (offensive).
     */
    private static int getTrapControlBonus(GameState state, PlayerSide side) {
        int bonus = 0;
        PlayerSide opponent = getOpponent(side);

        for (Piece p : state.getAlivePieces(side)) {
            // Check if near own traps (defensive positioning)
            if (Board.isTrap(p.getRow(), p.getCol(), side)) {
                // Piece in own trap area - not great but ok for defense
                bonus += 5;
            }
            // Check if piece threatens enemy trapped pieces
            if (Board.isTrap(p.getRow(), p.getCol(), opponent)) {
                // Our piece is in enemy trap - this is bad for us
                bonus -= 15;
            }
        }

        return bonus;
    }

    /**
     * Get all possible moves for a side.
     */
    private static List<int[]> getAllMoves(GameState state, PlayerSide side) {
        List<int[]> allMoves = new ArrayList<>();
        for (Piece piece : state.getAlivePieces(side)) {
            List<int[]> moves = GameEngine.getValidMoves(state, piece);
            for (int[] move : moves) {
                allMoves.add(new int[] { piece.getRow(), piece.getCol(), move[0], move[1] });
            }
        }
        return allMoves;
    }

    private static PlayerSide getOpponent(PlayerSide side) {
        return (side == PlayerSide.RED) ? PlayerSide.BLUE : PlayerSide.RED;
    }

    /**
     * Deep clone a game state for simulation.
     */
    private static GameState cloneState(GameState original) {
        GameState clone = new GameState();
        clone.setGameId(original.getGameId());
        clone.setBoard(original.getBoard()); // Board is immutable
        clone.setCurrentTurn(original.getCurrentTurn());
        clone.setStatus(original.getStatus());
        clone.setWinner(original.getWinner());
        clone.setRedPlayerId(original.getRedPlayerId());
        clone.setBluePlayerId(original.getBluePlayerId());
        clone.setAiGame(original.isAiGame());
        clone.setAiDifficulty(original.getAiDifficulty());

        // Deep clone pieces
        List<Piece> clonedPieces = new ArrayList<>();
        for (Piece p : original.getPieces()) {
            clonedPieces.add(new Piece(p.getAnimalType(), p.getSide(), p.getRow(), p.getCol(), p.isAlive()));
        }
        clone.setPieces(clonedPieces);

        return clone;
    }
}
