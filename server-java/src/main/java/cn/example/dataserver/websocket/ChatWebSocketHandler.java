package cn.example.dataserver.websocket;

import cn.example.dataserver.services.ChatPresenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

/**
 * 聊天下行通道：连接建立后登记用户，关闭时移除；客户端上行可忽略或后续扩展心跳
 */
@Component
@RequiredArgsConstructor
public class ChatWebSocketHandler extends TextWebSocketHandler {

    private final ChatWebSocketSessionRegistry chatWebSocketSessionRegistry;
    private final ChatPresenceService chatPresenceService;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        String userId = (String) session.getAttributes().get("userId");
        if (userId != null) {
            chatWebSocketSessionRegistry.register(userId, session);
            chatPresenceService.onUserConnected(userId);
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        // 当前版本仅服务端推送，客户端上行可留空；可后续扩展 ping/pong
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String userId = (String) session.getAttributes().get("userId");
        if (userId != null) {
            chatWebSocketSessionRegistry.removeIfCurrent(userId, session);
            chatPresenceService.onUserDisconnected(userId);
        }
    }
}
