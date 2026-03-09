package com.cothu.service;

import com.cothu.dto.GameStateResponse;
import com.cothu.dto.MoveRequest;
import com.cothu.dto.ValidMovesResponse;
import com.cothu.engine.AIEngine;
import com.cothu.engine.GameEngine;
import com.cothu.model.GameState;
import com.cothu.model.PlayerSide;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Service
public class GameService {

    private final Map<String, GameState> games = new ConcurrentHashMap<>();
    private final SimpMessagingTemplate messagingTemplate;
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(2);

    public GameService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Create a new game room.
     */
    public GameStateResponse createGame(String playerId) {
        GameState state = GameState.createNew();
        state.setRedPlayerId(playerId);
        games.put(state.getGameId(), state);
        return GameStateResponse.fromGameState(state);
    }

    /**
     * Join an existing game room.
     */
    public GameStateResponse joinGame(String gameId, String playerId) {
        GameState state = games.get(gameId);
        if (state == null)
            throw new RuntimeException("Game not found: " + gameId);
        if (state.getStatus() != GameState.GameStatus.WAITING) {
            throw new RuntimeException("Game already started or finished");
        }

        state.setBluePlayerId(playerId);
        state.setStatus(GameState.GameStatus.PLAYING);

        broadcastGameState(state);
        return GameStateResponse.fromGameState(state);
    }

    /**
     * Create a local 2-player game.
     */
    public GameStateResponse createLocalGame() {
        GameState state = GameState.createNew();
        state.setRedPlayerId("local-red");
        state.setBluePlayerId("local-blue");
        state.setStatus(GameState.GameStatus.PLAYING);
        games.put(state.getGameId(), state);
        return GameStateResponse.fromGameState(state);
    }

    /**
     * Create an AI game. Human plays Red, AI plays Blue.
     */
    public GameStateResponse createAIGame(String playerId, String difficulty) {
        GameState state = GameState.createNew();
        state.setRedPlayerId(playerId != null ? playerId : "player");
        state.setBluePlayerId("AI-" + difficulty);
        state.setStatus(GameState.GameStatus.PLAYING);
        state.setAiGame(true);
        state.setAiDifficulty(difficulty != null ? difficulty : "medium");
        games.put(state.getGameId(), state);
        return GameStateResponse.fromGameState(state);
    }

    /**
     * Process a move.
     */
    public GameStateResponse makeMove(MoveRequest request) {
        GameState state = games.get(request.getGameId());
        if (state == null)
            throw new RuntimeException("Game not found: " + request.getGameId());

        boolean success = GameEngine.makeMove(state,
                request.getFromRow(), request.getFromCol(),
                request.getToRow(), request.getToCol());

        if (!success) {
            throw new RuntimeException("Invalid move");
        }

        broadcastGameState(state);

        // If this is an AI game and it's now AI's turn, schedule AI move
        if (state.isAiGame()
                && state.getStatus() == GameState.GameStatus.PLAYING
                && state.getCurrentTurn() == PlayerSide.BLUE) {
            scheduleAIMove(state);
        }

        return GameStateResponse.fromGameState(state);
    }

    /**
     * Schedule an AI move with a slight delay for realism.
     */
    private void scheduleAIMove(GameState state) {
        int delayMs = switch (state.getAiDifficulty()) {
            case "easy" -> 600;
            case "hard" -> 1500;
            default -> 900; // medium
        };

        scheduler.schedule(() -> {
            try {
                int[] bestMove = AIEngine.getBestMove(state, state.getAiDifficulty());
                if (bestMove != null) {
                    GameEngine.makeMove(state, bestMove[0], bestMove[1], bestMove[2], bestMove[3]);
                    broadcastGameState(state);
                }
            } catch (Exception e) {
                System.err.println("AI move failed: " + e.getMessage());
            }
        }, delayMs, TimeUnit.MILLISECONDS);
    }

    /**
     * Get valid moves for a piece at a position.
     */
    public ValidMovesResponse getValidMoves(String gameId, int row, int col) {
        GameState state = games.get(gameId);
        if (state == null)
            throw new RuntimeException("Game not found: " + gameId);

        List<int[]> moves = GameEngine.getValidMovesAt(state, row, col);
        return new ValidMovesResponse(row, col, moves);
    }

    /**
     * Get current game state.
     */
    public GameStateResponse getGameState(String gameId) {
        GameState state = games.get(gameId);
        if (state == null)
            throw new RuntimeException("Game not found: " + gameId);
        return GameStateResponse.fromGameState(state);
    }

    /**
     * List all available games (waiting for players).
     */
    public List<GameStateResponse> listAvailableGames() {
        return games.values().stream()
                .filter(g -> g.getStatus() == GameState.GameStatus.WAITING)
                .map(GameStateResponse::fromGameState)
                .toList();
    }

    /**
     * Broadcast game state to all subscribers of the game topic.
     */
    private void broadcastGameState(GameState state) {
        messagingTemplate.convertAndSend(
                "/topic/game/" + state.getGameId(),
                GameStateResponse.fromGameState(state));
    }
}
