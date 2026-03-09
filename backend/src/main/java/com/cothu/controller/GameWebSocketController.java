package com.cothu.controller;

import com.cothu.dto.GameStateResponse;
import com.cothu.dto.MoveRequest;
import com.cothu.service.GameService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class GameWebSocketController {

    private final GameService gameService;

    public GameWebSocketController(GameService gameService) {
        this.gameService = gameService;
    }

    /**
     * Handle a move submitted via WebSocket.
     * Client sends to: /app/game.move
     * Response broadcast to: /topic/game/{gameId}
     */
    @MessageMapping("/game.move")
    public void handleMove(MoveRequest request) {
        try {
            gameService.makeMove(request);
        } catch (Exception e) {
            // Move was invalid - could send error back to specific user
            System.err.println("Invalid move: " + e.getMessage());
        }
    }
}
