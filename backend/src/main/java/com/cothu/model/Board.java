package com.cothu.model;

import lombok.Getter;

/**
 * Represents the 7x9 game board with special cells: Rivers, Traps, Dens.
 *
 * Board layout (7 cols x 9 rows):
 * Row 0 (Red side): [N][N][TRAP_R][DEN_R][TRAP_R][N][N]
 * Row 1 (Red side): [N][N][N][TRAP_R][N][N][N]
 * Rows 2: Normal
 * Rows 3-5: Contains rivers (cols 1-2 and 4-5 on rows 3-5)
 * Row 7 (Blue side): [N][N][N][TRAP_B][N][N][N]
 * Row 8 (Blue side): [N][N][TRAP_B][DEN_B][TRAP_B][N][N]
 */
@Getter
public class Board {

    public static final int ROWS = 9;
    public static final int COLS = 7;

    private final CellType[][] cells;

    public Board() {
        cells = new CellType[ROWS][COLS];
        initializeBoard();
    }

    private void initializeBoard() {
        // Fill all with NORMAL
        for (int r = 0; r < ROWS; r++) {
            for (int c = 0; c < COLS; c++) {
                cells[r][c] = CellType.NORMAL;
            }
        }

        // Red Den (top center)
        cells[0][3] = CellType.DEN_RED;

        // Red Traps (around Red Den)
        cells[0][2] = CellType.TRAP_RED;
        cells[0][4] = CellType.TRAP_RED;
        cells[1][3] = CellType.TRAP_RED;

        // Blue Den (bottom center)
        cells[8][3] = CellType.DEN_BLUE;

        // Blue Traps (around Blue Den)
        cells[8][2] = CellType.TRAP_BLUE;
        cells[8][4] = CellType.TRAP_BLUE;
        cells[7][3] = CellType.TRAP_BLUE;

        // Rivers: two 3x2 blocks (rows 3-5, cols 1-2 and cols 4-5)
        for (int r = 3; r <= 5; r++) {
            cells[r][1] = CellType.RIVER;
            cells[r][2] = CellType.RIVER;
            cells[r][4] = CellType.RIVER;
            cells[r][5] = CellType.RIVER;
        }
    }

    public CellType getCell(int row, int col) {
        if (!isValidPosition(row, col))
            return null;
        return cells[row][col];
    }

    public static boolean isValidPosition(int row, int col) {
        return row >= 0 && row < ROWS && col >= 0 && col < COLS;
    }

    public static boolean isRiver(int row, int col) {
        if (!isValidPosition(row, col))
            return false;
        return (row >= 3 && row <= 5) && ((col == 1 || col == 2) || (col == 4 || col == 5));
    }

    public static boolean isTrap(int row, int col, PlayerSide trapOwner) {
        if (trapOwner == PlayerSide.RED) {
            return (row == 0 && (col == 2 || col == 4)) || (row == 1 && col == 3);
        } else {
            return (row == 8 && (col == 2 || col == 4)) || (row == 7 && col == 3);
        }
    }

    public static boolean isDen(int row, int col, PlayerSide denOwner) {
        if (denOwner == PlayerSide.RED) {
            return row == 0 && col == 3;
        } else {
            return row == 8 && col == 3;
        }
    }
}
