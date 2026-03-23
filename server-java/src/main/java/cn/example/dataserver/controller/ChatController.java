package cn.example.dataserver.controller;

import cn.example.dataserver.dto.ChatReadDTO;
import cn.example.dataserver.dto.ChatSendDTO;
import cn.example.dataserver.services.AuthService;
import cn.example.dataserver.services.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 聊天 REST 接口
 */
@CrossOrigin
@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final AuthService authService;

    @GetMapping("/conversations")
    public String listConversations(
            @RequestHeader("Authorization") String token,
            @RequestParam(required = false) Long page,
            @RequestParam(required = false) Long size) {
        return chatService.listConversations(authService.checkToken(token), page, size);
    }

    @GetMapping("/conversations/with/{peerUserId}")
    public String getOrCreateWithPeer(
            @RequestHeader("Authorization") String token,
            @PathVariable String peerUserId) {
        return chatService.getOrCreateWithPeer(authService.checkToken(token), peerUserId);
    }

    @GetMapping("/messages")
    public String listMessages(
            @RequestHeader("Authorization") String token,
            @RequestParam String conversationId,
            @RequestParam(required = false) Long page,
            @RequestParam(required = false) Long size) {
        return chatService.listMessages(authService.checkToken(token), conversationId, page, size);
    }

    @PostMapping("/messages/send")
    public String sendMessage(@RequestHeader("Authorization") String token, @RequestBody ChatSendDTO dto) {
        return chatService.sendMessage(authService.checkToken(token), dto);
    }

    @PostMapping("/messages/read")
    public String markRead(@RequestHeader("Authorization") String token, @RequestBody ChatReadDTO dto) {
        return chatService.markRead(authService.checkToken(token), dto);
    }
}
