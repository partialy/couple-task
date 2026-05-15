package cn.example.dataserver.websocket;

import cn.example.dataserver.services.ChatPresenceService;
import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONObject;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * 聊天 WebSocket 通道：连接登记、心跳响应、断开清理
 */
@Slf4j
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
        String userId = (String) session.getAttributes().get("userId");
        if (userId == null) return;

        try {
            JSONObject json = JSON.parseObject(message.getPayload());
            String event = json.getString("event");
            if ("ping".equals(event)) {
                String peerUserId = null;
                JSONObject data = json.getJSONObject("data");
                if (data != null) {
                    peerUserId = data.getString("peerUserId");
                }
                handlePing(session, peerUserId);
            }
        } catch (Exception e) {
            log.warn("解析客户端上行消息失败 userId={}", userId, e);
        }
    }

    /**
     * 处理客户端心跳 ping，回复 pong 并附带伙伴在线状态
     */
    private void handlePing(WebSocketSession session, String peerUserId) {
        // 优先使用前端传入的绑定对象 ID，避免心跳时查询数据库
        boolean partnerOnline = peerUserId != null && !peerUserId.isBlank()
                && chatWebSocketSessionRegistry.isOnline(peerUserId);

        Map<String, Object> data = new HashMap<>(4);
        data.put("partnerOnline", partnerOnline);

        Map<String, Object> payload = new HashMap<>(4);
        payload.put("event", "pong");
        payload.put("data", data);

        try {
            session.sendMessage(new TextMessage(JSON.toJSONString(payload)));
        } catch (IOException e) {
            log.error("心跳 pong 发送失败", e);
        }
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
