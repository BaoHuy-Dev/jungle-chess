package com.cothu.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MoveRequest {
    private String gameId;
    private String playerId;
    private int fromRow;
    private int fromCol;
    private int toRow;
    private int toCol;
}
