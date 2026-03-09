package com.cothu.model;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Represents the full state of a game, including board, pieces, turns, and
 * result.
 */
@Data
public class GameState {
    private String gameId;
    private Board board;
    private List<Piece> pieces;
    private PlayerSide currentTurn;
    private GameStatus status;
    private PlayerSide winner;
    private String redPlayerId;
    private String bluePlayerId;
    private long lastMoveTimestamp;
    private List<int[]> lastMoveHighlight; // [fromRow, fromCol, toRow, toCol]
    private boolean aiGame;
    private String aiDifficulty; // "easy", "medium", "hard"

    public enum GameStatus {
        WAITING, // Waiting for second player
        PLAYING, // Game in progress
        FINISHED // Game ended
    }

    /**
     * Create a new game with initial piece placement.
     */
    public static GameState createNew() {
        GameState state = new GameState();
        state.gameId = UUID.randomUUID().toString().substring(0, 8);
        state.board = new Board();
        state.pieces = createInitialPieces();
        state.currentTurn = PlayerSide.RED;
        state.status = GameStatus.WAITING;
        state.lastMoveTimestamp = System.currentTimeMillis();
        return state;
    }

    private static List<Piece> createInitialPieces() {
        List<Piece> pieces = new ArrayList<>();

        // RED pieces (top side, rows 0-3)
        // Standard layout:
        // Row 0: Lion(0,0) Tiger(0,6)
        // Row 1: Dog(1,1) Cat(1,5)
        // Row 2: Rat(2,0) Leopard(2,2) Wolf(2,4) Elephant(2,6)
        pieces.add(new Piece(AnimalType.LION, PlayerSide.RED, 0, 0));
        pieces.add(new Piece(AnimalType.TIGER, PlayerSide.RED, 0, 6));
        pieces.add(new Piece(AnimalType.DOG, PlayerSide.RED, 1, 1));
        pieces.add(new Piece(AnimalType.CAT, PlayerSide.RED, 1, 5));
        pieces.add(new Piece(AnimalType.RAT, PlayerSide.RED, 2, 0));
        pieces.add(new Piece(AnimalType.LEOPARD, PlayerSide.RED, 2, 2));
        pieces.add(new Piece(AnimalType.WOLF, PlayerSide.RED, 2, 4));
        pieces.add(new Piece(AnimalType.ELEPHANT, PlayerSide.RED, 2, 6));

        // BLUE pieces (bottom side, rows 6-8) - mirrored
        pieces.add(new Piece(AnimalType.TIGER, PlayerSide.BLUE, 8, 0));
        pieces.add(new Piece(AnimalType.LION, PlayerSide.BLUE, 8, 6));
        pieces.add(new Piece(AnimalType.CAT, PlayerSide.BLUE, 7, 1));
        pieces.add(new Piece(AnimalType.DOG, PlayerSide.BLUE, 7, 5));
        pieces.add(new Piece(AnimalType.ELEPHANT, PlayerSide.BLUE, 6, 0));
        pieces.add(new Piece(AnimalType.WOLF, PlayerSide.BLUE, 6, 2));
        pieces.add(new Piece(AnimalType.LEOPARD, PlayerSide.BLUE, 6, 4));
        pieces.add(new Piece(AnimalType.RAT, PlayerSide.BLUE, 6, 6));

        return pieces;
    }

    /**
     * Find a piece at the given position that is alive.
     */
    public Piece getPieceAt(int row, int col) {
        return pieces.stream()
                .filter(p -> p.isAlive() && p.getRow() == row && p.getCol() == col)
                .findFirst()
                .orElse(null);
    }

    /**
     * Get all alive pieces for a given side.
     */
    public List<Piece> getAlivePieces(PlayerSide side) {
        return pieces.stream()
                .filter(p -> p.isAlive() && p.getSide() == side)
                .toList();
    }

    /**
     * Switch the current turn to the other player.
     */
    public void switchTurn() {
        this.currentTurn = (currentTurn == PlayerSide.RED) ? PlayerSide.BLUE : PlayerSide.RED;
    }
}
