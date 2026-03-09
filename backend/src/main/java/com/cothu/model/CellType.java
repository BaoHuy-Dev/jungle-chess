package com.cothu.model;

/**
 * Represents the different types of cells on the board.
 */
public enum CellType {
    NORMAL,
    RIVER,
    TRAP_RED,    // Trap belonging to Red player (top)
    TRAP_BLUE,   // Trap belonging to Blue player (bottom)
    DEN_RED,     // Den belonging to Red player (top)
    DEN_BLUE     // Den belonging to Blue player (bottom)
}
