package com.cothu.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ValidMovesResponse {
    private int row;
    private int col;
    private List<int[]> validMoves;
}
