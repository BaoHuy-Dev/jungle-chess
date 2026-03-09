package com.cothu.dto;

import com.cothu.model.GameState;
import com.cothu.model.Piece;
import com.cothu.model.PlayerSide;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GameStateResponse {
    private String gameId;
    private String status;
    private String currentTurn;
    private String winner;
    private List<PieceDto> pieces;
    private int[][] boardLayout; // 0=normal, 1=river, 2=trap_red, 3=trap_blue, 4=den_red, 5=den_blue
    private String redPlayerId;
    private String bluePlayerId;
    private boolean isAIGame;
    private String aiDifficulty;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class PieceDto {
        private String type;
        private String side;
        private int row;
        private int col;
        private boolean alive;
        private int rank;
        private String name;
    }

    public static GameStateResponse fromGameState(GameState state) {
        GameStateResponse resp = new GameStateResponse();
        resp.gameId = state.getGameId();
        resp.status = state.getStatus().name();
        resp.currentTurn = state.getCurrentTurn().name();
        resp.winner = state.getWinner() != null ? state.getWinner().name() : null;
        resp.redPlayerId = state.getRedPlayerId();
        resp.bluePlayerId = state.getBluePlayerId();
        resp.isAIGame = state.isAiGame();
        resp.aiDifficulty = state.getAiDifficulty();

        // Convert pieces
        resp.pieces = state.getPieces().stream()
                .map(p -> new PieceDto(
                        p.getAnimalType().getModelId(),
                        p.getSide().name(),
                        p.getRow(),
                        p.getCol(),
                        p.isAlive(),
                        p.getAnimalType().getRank(),
                        p.getAnimalType().getVietnameseName()))
                .toList();

        // Convert board layout to int array for frontend
        var board = state.getBoard();
        resp.boardLayout = new int[9][7];
        for (int r = 0; r < 9; r++) {
            for (int c = 0; c < 7; c++) {
                resp.boardLayout[r][c] = switch (board.getCell(r, c)) {
                    case NORMAL -> 0;
                    case RIVER -> 1;
                    case TRAP_RED -> 2;
                    case TRAP_BLUE -> 3;
                    case DEN_RED -> 4;
                    case DEN_BLUE -> 5;
                };
            }
        }

        return resp;
    }
}
