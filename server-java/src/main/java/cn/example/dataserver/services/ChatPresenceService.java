package cn.example.dataserver.services;

import cn.example.dataserver.entity.BindingRelations;
import cn.example.dataserver.entity.Users;
import cn.example.dataserver.enums.BindingRelation;
import cn.example.dataserver.service.BindingRelationsService;
import cn.example.dataserver.service.UsersService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

/**
 * 聊天在线状态：用户连接或断开 WebSocket 时通知已绑定伙伴，同步更新登录时间
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ChatPresenceService {

    private final BindingRelationsService bindingRelationsService;
    private final ChatWebSocketPushService chatWebSocketPushService;
    private final UsersService usersService;

    /**
     * 用户 WebSocket 连接成功：更新最后登录时间，并向对方推送其在线
     */
    public void onUserConnected(String userId) {
        try {
            usersService.lambdaUpdate()
                    .eq(Users::getId, userId)
                    .set(Users::getLastLoginAt, new Date())
                    .update();
        } catch (Exception e) {
            log.error("更新用户最后登录时间失败 userId={}", userId, e);
        }

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

    /**
     * 查询用户已接受绑定关系中的对方用户 ID，无则返回 null
     */
    public String findAcceptedPeerUserId(String userId) {
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
