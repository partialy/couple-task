package cn.example.dataserver.websocket;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 按用户 ID 维护 WebSocket 会话（同用户后连接覆盖先连接）
 */
@Slf4j
@Component
public class ChatWebSocketSessionRegistry {

    private final ConcurrentHashMap<String, WebSocketSession> sessions = new ConcurrentHashMap<>();

    /**
     * 注册或替换该用户的连接
     */
    public void register(String userId, WebSocketSession session) {
        sessions.put(userId, session);
    }

    /**
     * 连接关闭时移除（仅当仍是当前会话时移除）
     */
    @SuppressWarnings("resource")
    public void removeIfCurrent(String userId, WebSocketSession session) {
        // 注意：这里不主动关闭 session，连接关闭由 WebSocket 生命周期管理
        sessions.computeIfPresent(userId, (k, v) -> v == session ? null : v);
    }

    /**
     * 向用户推送 JSON 文本（用户不在线则忽略）
     */
    public void sendJsonToUser(String userId, String json) {
        WebSocketSession session = sessions.get(userId);
        if (session == null) {
            return;
        }
        if (!session.isOpen()) {
            // 惰性清理：避免断开连接残留导致在线状态误判
            sessions.remove(userId, session);
            return;
        }
        try {
            session.sendMessage(new TextMessage(json));
        } catch (IOException e) {
            log.error("WebSocket 推送失败 userId={}", userId, e);
        }
    }

    /**
     * 判断用户是否在线（以当前会话是否存在且可用为准）
     */
    public boolean isOnline(String userId) {
        WebSocketSession session = sessions.get(userId);
        if (session == null) {
            return false;
        }
        if (!session.isOpen()) {
            // 惰性清理：若会话已不可用则移除，后续查询直接命中离线
            sessions.remove(userId, session);
            return false;
        }
        return true;
    }
}
