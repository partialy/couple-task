package cn.example.dataserver.services;

import cn.example.dataserver.websocket.SystemNoticeWebSocketSessionRegistry;
import com.alibaba.fastjson2.JSON;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SystemNoticeWebSocketPushService {

    private final SystemNoticeWebSocketSessionRegistry registry;

    public void pushNotice(String receiverUserId, Map<String, Object> notice) {
        Map<String, Object> payload = new HashMap<>(4);
        payload.put("event", "systemNotice");
        payload.put("data", notice);
        registry.sendJsonToUser(receiverUserId, JSON.toJSONString(payload));
    }
}
