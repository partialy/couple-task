package cn.example.dataserver.services;

import cn.example.dataserver.entity.BindingRelations;
import cn.example.dataserver.enums.BindingRelation;
import cn.example.dataserver.service.BindingRelationsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 聊天在线状态：用户连接或断开 WebSocket 时通知已绑定伙伴
 */
@Service
@RequiredArgsConstructor
public class ChatPresenceService {

    private final BindingRelationsService bindingRelationsService;
    private final ChatWebSocketPushService chatWebSocketPushService;

    /**
     * 用户 WebSocket 连接成功，向对方推送其在线
     */
    public void onUserConnected(String userId) {
        String peerId = findAcceptedPeerUserId(userId);
        if (peerId != null) {
            chatWebSocketPushService.pushPeerPresence(peerId, userId, true);
        }
    }

    /**
     * 用户 WebSocket 断开，向对方推送其离线
     */
    public void onUserDisconnected(String userId) {
        String peerId = findAcceptedPeerUserId(userId);
        if (peerId != null) {
            chatWebSocketPushService.pushPeerPresence(peerId, userId, false);
        }
    }

    private String findAcceptedPeerUserId(String userId) {
        List<BindingRelations> list = bindingRelationsService.lambdaQuery()
                .eq(BindingRelations::getStatus, BindingRelation.ACCEPTED.getValue())
                .and(w -> w.eq(BindingRelations::getUserId, userId)
                        .or()
                        .eq(BindingRelations::getTargetId, userId))
                .list();
        if (list.isEmpty()) {
            return null;
        }
        BindingRelations br = list.get(0);
        return userId.equals(br.getUserId()) ? br.getTargetId() : br.getUserId();
    }
}
