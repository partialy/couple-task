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

    /**
     * 通知消息发送方：对方已读会话内未读消息（用于前端同步「已读」回执）
     *
     * @param messageSenderUserId 应收到推送的用户（己方消息被对方标记已读的一方）
     * @param conversationId      会话 ID
     * @param readByUserId        执行已读的一方用户 ID
     */
    public void pushConversationRead(String messageSenderUserId, String conversationId, String readByUserId) {
        if (messageSenderUserId == null || conversationId == null || readByUserId == null) {
            return;
        }
        Map<String, Object> data = new HashMap<>(4);
        data.put("conversationId", conversationId);
        data.put("readByUserId", readByUserId);
        Map<String, Object> payload = new HashMap<>(4);
        payload.put("event", "conversationRead");
        payload.put("data", data);
        chatWebSocketSessionRegistry.sendJsonToUser(messageSenderUserId, JSON.toJSONString(payload));
    }
}
