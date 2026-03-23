package cn.example.dataserver.services;

import cn.example.dataserver.vo.MessageVO;
import cn.example.dataserver.websocket.ChatWebSocketSessionRegistry;
import com.alibaba.fastjson2.JSON;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

/**
 * 聊天消息 WebSocket 推送封装
 */
@Service
@RequiredArgsConstructor
public class ChatWebSocketPushService {

    private final ChatWebSocketSessionRegistry chatWebSocketSessionRegistry;

    /**
     * 向对方用户推送一条新消息事件
     */
    public void pushNewMessage(String peerUserId, MessageVO messageVO) {
        Map<String, Object> payload = new HashMap<>(4);
        payload.put("event", "newMessage");
        payload.put("data", messageVO);
        chatWebSocketSessionRegistry.sendJsonToUser(peerUserId, JSON.toJSONString(payload));
    }

    /**
     * 向对方推送伙伴在线状态变化
     *
     * @param targetUserId 接收推送的用户
     * @param relatedUserId  状态变化的用户（伙伴）
     * @param online         是否在线
     */
    public void pushPeerPresence(String targetUserId, String relatedUserId, boolean online) {
        Map<String, Object> data = new HashMap<>(4);
        data.put("userId", relatedUserId);
        data.put("online", online);
        Map<String, Object> payload = new HashMap<>(4);
        payload.put("event", "peerPresence");
        payload.put("data", data);
        chatWebSocketSessionRegistry.sendJsonToUser(targetUserId, JSON.toJSONString(payload));
    }
}
