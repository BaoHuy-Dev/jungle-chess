package com.cothu.controller;

import com.cothu.dto.GameStateResponse;
import com.cothu.dto.MoveRequest;
import com.cothu.dto.ValidMovesResponse;
import com.cothu.service.GameService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/game")
public class GameController {

    private final GameService gameService;

    public GameController(GameService gameService) {
        this.gameService = gameService;
    }

    /**
     * Make a move via REST.
     */
    @PostMapping("/{gameId}/move")
    public ResponseEntity<GameStateResponse> makeMove(
            @PathVariable String gameId,
            @RequestBody MoveRequest request) {
        request.setGameId(gameId);
        return ResponseEntity.ok(gameService.makeMove(request));
    }

    /**
     * Create a new online game room.
     */
    @PostMapping("/create")
    public ResponseEntity<GameStateResponse> createGame(@RequestBody(required = false) Map<String, String> body) {
        String playerId = body != null && body.containsKey("playerId")
                ? body.get("playerId")
                : UUID.randomUUID().toString().substring(0, 8);
        return ResponseEntity.ok(gameService.createGame(playerId));
    }

    /**
     * Join an existing game room.
     */
    @PostMapping("/join/{gameId}")
    public ResponseEntity<GameStateResponse> joinGame(
            @PathVariable String gameId,
            @RequestBody(required = false) Map<String, String> body) {
        String playerId = body != null && body.containsKey("playerId")
                ? body.get("playerId")
                : UUID.randomUUID().toString().substring(0, 8);
        return ResponseEntity.ok(gameService.joinGame(gameId, playerId));
    }

    /**
     * Create a local 2-player game.
     */
    @PostMapping("/local")
    public ResponseEntity<GameStateResponse> createLocalGame() {
        return ResponseEntity.ok(gameService.createLocalGame());
    }

    /**
     * Create an AI game. Human plays Red, AI plays Blue.
     */
    @PostMapping("/ai")
    public ResponseEntity<GameStateResponse> createAIGame(@RequestBody(required = false) Map<String, String> body) {
        String playerId = body != null && body.containsKey("playerId")
                ? body.get("playerId")
                : "player";
        String difficulty = body != null && body.containsKey("difficulty")
                ? body.get("difficulty")
                : "medium";
        return ResponseEntity.ok(gameService.createAIGame(playerId, difficulty));
    }

    /**
     * Get current game state.
     */
    @GetMapping("/{gameId}")
    public ResponseEntity<GameStateResponse> getGame(@PathVariable String gameId) {
        return ResponseEntity.ok(gameService.getGameState(gameId));
    }

    /**
     * Get valid moves for a piece at a position.
     */
    @GetMapping("/{gameId}/moves")
    public ResponseEntity<ValidMovesResponse> getValidMoves(
            @PathVariable String gameId,
            @RequestParam int row,
            @RequestParam int col) {
        return ResponseEntity.ok(gameService.getValidMoves(gameId, row, col));
    }

    /**
     * List all available games waiting for players.
     */
    @GetMapping("/list")
    public ResponseEntity<List<GameStateResponse>> listGames() {
        return ResponseEntity.ok(gameService.listAvailableGames());
    }
}
