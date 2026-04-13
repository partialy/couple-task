package cn.example.dataserver.websocket;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

@Slf4j
@Component
public class SystemNoticeWebSocketSessionRegistry {

    private final ConcurrentHashMap<String, WebSocketSession> sessions = new ConcurrentHashMap<>();

    public void register(String userId, WebSocketSession session) {
        sessions.put(userId, session);
    }

    @SuppressWarnings("resource")
    public void removeIfCurrent(String userId, WebSocketSession session) {
        sessions.computeIfPresent(userId, (k, v) -> v == session ? null : v);
    }

    public void sendJsonToUser(String userId, String json) {
        WebSocketSession session = sessions.get(userId);
        if (session == null) {
            return;
        }
        if (!session.isOpen()) {
            sessions.remove(userId, session);
            return;
        }
        try {
            session.sendMessage(new TextMessage(json));
        } catch (IOException e) {
            log.error("system notice ws push failed userId={}", userId, e);
        }
    }
}
