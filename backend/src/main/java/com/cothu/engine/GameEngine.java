package com.cothu.engine;

import com.cothu.model.*;

import java.util.ArrayList;
import java.util.List;

/**
 * Core game engine implementing all Jungle Chess (Cờ Thú) rules.
 */
public class GameEngine {

    /**
     * Attempt to make a move. Returns true if the move was valid and executed.
     */
    public static boolean makeMove(GameState state, int fromRow, int fromCol, int toRow, int toCol) {
        if (state.getStatus() != GameState.GameStatus.PLAYING)
            return false;

        Piece piece = state.getPieceAt(fromRow, fromCol);
        if (piece == null || piece.getSide() != state.getCurrentTurn())
            return false;

        List<int[]> validMoves = getValidMoves(state, piece);
        boolean isValid = validMoves.stream()
                .anyMatch(m -> m[0] == toRow && m[1] == toCol);

        if (!isValid)
            return false;

        // Execute the move
        Piece target = state.getPieceAt(toRow, toCol);
        if (target != null && target.getSide() != piece.getSide()) {
            target.setAlive(false); // Capture
        }

        piece.setRow(toRow);
        piece.setCol(toCol);

        state.setLastMoveHighlight(List.of(new int[] { fromRow, fromCol, toRow, toCol }));
        state.setLastMoveTimestamp(System.currentTimeMillis());

        // Check win conditions
        if (checkWinCondition(state, piece.getSide())) {
            state.setStatus(GameState.GameStatus.FINISHED);
            state.setWinner(piece.getSide());
        } else {
            state.switchTurn();
        }

        return true;
    }

    /**
     * Get all valid moves for a piece.
     */
    public static List<int[]> getValidMoves(GameState state, Piece piece) {
        List<int[]> moves = new ArrayList<>();
        if (!piece.isAlive())
            return moves;

        // Check all 4 orthogonal directions
        int[][] directions = { { -1, 0 }, { 1, 0 }, { 0, -1 }, { 0, 1 } };

        // Lion and Tiger can jump over rivers
        if (piece.getAnimalType() == AnimalType.LION || piece.getAnimalType() == AnimalType.TIGER) {
            addJumpMoves(state, piece, moves, directions);
        }

        // Normal 1-step moves
        for (int[] dir : directions) {
            int newRow = piece.getRow() + dir[0];
            int newCol = piece.getCol() + dir[1];

            if (!Board.isValidPosition(newRow, newCol))
                continue;

            // Only Rat can enter river
            if (Board.isRiver(newRow, newCol) && piece.getAnimalType() != AnimalType.RAT)
                continue;

            // Can't enter own den
            if (Board.isDen(newRow, newCol, piece.getSide()))
                continue;

            // Check if can move to this cell
            Piece target = state.getPieceAt(newRow, newCol);
            if (target == null) {
                moves.add(new int[] { newRow, newCol });
            } else if (target.getSide() != piece.getSide()) {
                // Can capture?
                if (canCapture(state, piece, target)) {
                    moves.add(new int[] { newRow, newCol });
                }
            }
        }

        return moves;
    }

    /**
     * Add river-jumping moves for Lion and Tiger.
     */
    private static void addJumpMoves(GameState state, Piece piece, List<int[]> moves, int[][] directions) {
        for (int[] dir : directions) {
            int nextRow = piece.getRow() + dir[0];
            int nextCol = piece.getCol() + dir[1];

            // Check if the adjacent cell is river
            if (!Board.isValidPosition(nextRow, nextCol) || !Board.isRiver(nextRow, nextCol))
                continue;

            // Jump across the river
            int jumpRow = nextRow;
            int jumpCol = nextCol;
            boolean blocked = false;

            while (Board.isValidPosition(jumpRow, jumpCol) && Board.isRiver(jumpRow, jumpCol)) {
                // Check if there's a Rat in the river blocking the jump
                Piece riverPiece = state.getPieceAt(jumpRow, jumpCol);
                if (riverPiece != null && riverPiece.getAnimalType() == AnimalType.RAT) {
                    blocked = true;
                    break;
                }
                jumpRow += dir[0];
                jumpCol += dir[1];
            }

            if (blocked || !Board.isValidPosition(jumpRow, jumpCol))
                continue;

            // Landing position
            Piece landTarget = state.getPieceAt(jumpRow, jumpCol);
            if (landTarget == null) {
                moves.add(new int[] { jumpRow, jumpCol });
            } else if (landTarget.getSide() != piece.getSide()) {
                if (piece.getAnimalType().canCapture(landTarget.getAnimalType())) {
                    moves.add(new int[] { jumpRow, jumpCol });
                }
            }
        }
    }

    /**
     * Check if a piece can capture a target, considering special rules.
     */
    private static boolean canCapture(GameState state, Piece attacker, Piece defender) {
        // Piece in enemy trap has rank 0 - any piece can capture it
        PlayerSide opposingSide = (defender.getSide() == PlayerSide.RED) ? PlayerSide.BLUE : PlayerSide.RED;
        if (Board.isTrap(defender.getRow(), defender.getCol(), opposingSide)) {
            return true;
        }

        // Rat in water cannot capture Elephant on land
        if (attacker.getAnimalType() == AnimalType.RAT && defender.getAnimalType() == AnimalType.ELEPHANT) {
            if (attacker.isInRiver() && !defender.isInRiver())
                return false;
        }

        // Land piece cannot capture Rat in water
        if (defender.isInRiver() && !attacker.isInRiver()) {
            return false;
        }

        // Rat on land cannot capture Rat in water
        if (attacker.getAnimalType() == AnimalType.RAT && defender.getAnimalType() == AnimalType.RAT) {
            if (!attacker.isInRiver() && defender.isInRiver())
                return false;
        }

        return attacker.getAnimalType().canCapture(defender.getAnimalType());
    }

    /**
     * Check win conditions:
     * 1. A piece enters the opponent's den
     * 2. All opponent's pieces are captured
     */
    private static boolean checkWinCondition(GameState state, PlayerSide side) {
        // Check if any piece is in opponent's den
        PlayerSide opponent = (side == PlayerSide.RED) ? PlayerSide.BLUE : PlayerSide.RED;
        for (Piece p : state.getAlivePieces(side)) {
            if (Board.isDen(p.getRow(), p.getCol(), opponent)) {
                return true;
            }
        }

        // Check if all opponent pieces are dead
        return state.getAlivePieces(opponent).isEmpty();
    }

    /**
     * Get valid moves for a specific position (for UI highlighting).
     */
    public static List<int[]> getValidMovesAt(GameState state, int row, int col) {
        Piece piece = state.getPieceAt(row, col);
        if (piece == null)
            return new ArrayList<>();
        return getValidMoves(state, piece);
    }
}
