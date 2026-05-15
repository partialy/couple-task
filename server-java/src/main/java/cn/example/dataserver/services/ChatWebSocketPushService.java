package cn.example.dataserver.services;

import cn.example.dataserver.vo.MessageVO;
import cn.example.dataserver.websocket.ChatWebSocketSessionRegistry;
import com.alibaba.fastjson2.JSON;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ChatWebSocketPushService {

    private final ChatWebSocketSessionRegistry chatWebSocketSessionRegistry;
    private final SystemNoticeWebSocketPushService systemNoticeWebSocketPushService;

    public void pushNewMessage(String peerUserId, MessageVO messageVO) {
        Map<String, Object> payload = new HashMap<>(4);
        payload.put("event", "newMessage");
        payload.put("data", messageVO);
        chatWebSocketSessionRegistry.sendJsonToUser(peerUserId, JSON.toJSONString(payload));
    }

    public void pushPeerPresence(String targetUserId, String relatedUserId, boolean online) {
        Map<String, Object> data = new HashMap<>(4);
        data.put("userId", relatedUserId);
        data.put("online", online);
        Map<String, Object> payload = new HashMap<>(4);
        payload.put("event", "peerPresence");
        payload.put("data", data);
        chatWebSocketSessionRegistry.sendJsonToUser(targetUserId, JSON.toJSONString(payload));
    }

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

    public void pushSystemNotice(String receiverUserId, Map<String, Object> noticeData) {
        if (receiverUserId == null || noticeData == null) {
            return;
        }
        systemNoticeWebSocketPushService.pushNotice(receiverUserId, noticeData);
    }
}
