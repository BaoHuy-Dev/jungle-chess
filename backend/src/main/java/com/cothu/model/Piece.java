package com.cothu.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents a game piece (animal) on the board.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Piece {
    private AnimalType animalType;
    private PlayerSide side;
    private int row;
    private int col;
    private boolean alive;

    public Piece(AnimalType animalType, PlayerSide side, int row, int col) {
        this.animalType = animalType;
        this.side = side;
        this.row = row;
        this.col = col;
        this.alive = true;
    }

    /**
     * Check if this piece is currently in a river cell.
     */
    public boolean isInRiver() {
        return Board.isRiver(row, col);
    }
}
