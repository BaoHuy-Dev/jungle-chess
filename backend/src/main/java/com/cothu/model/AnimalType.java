package com.cothu.model;

import lombok.Getter;

/**
 * Animal types with their rank (power level).
 * Higher rank can capture lower rank, with special exception: Rat(1) can
 * capture Elephant(8).
 */
@Getter
public enum AnimalType {
    RAT(1, "Chuột", "rat"),
    CAT(2, "Mèo", "cat"),
    WOLF(3, "Sói", "wolf"),
    DOG(4, "Chó", "dog"),
    LEOPARD(5, "Báo", "leopard"),
    TIGER(6, "Hổ", "tiger"),
    LION(7, "Sư Tử", "lion"),
    ELEPHANT(8, "Voi", "elephant");

    private final int rank;
    private final String vietnameseName;
    private final String modelId;

    AnimalType(int rank, String vietnameseName, String modelId) {
        this.rank = rank;
        this.vietnameseName = vietnameseName;
        this.modelId = modelId;
    }

    /**
     * Check if this animal can capture the target animal (ignoring traps).
     * Special rule: Rat can capture Elephant, Elephant cannot capture Rat.
     */
    public boolean canCapture(AnimalType target) {
        if (this == RAT && target == ELEPHANT)
            return true;
        if (this == ELEPHANT && target == RAT)
            return false;
        return this.rank >= target.rank;
    }
}
