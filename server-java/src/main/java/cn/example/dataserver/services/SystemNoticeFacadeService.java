package cn.example.dataserver.services;

import cn.example.dataserver.common.Result;
import cn.example.dataserver.entity.BindingRelations;
import cn.example.dataserver.entity.SystemNotices;
import cn.example.dataserver.entity.Users;
import cn.example.dataserver.enums.BindingRelation;
import cn.example.dataserver.service.BindingRelationsService;
import cn.example.dataserver.service.SystemNoticesService;
import com.alibaba.fastjson2.JSON;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SystemNoticeFacadeService {

    public static final String TASK_PUBLISH = "task_publish";
    public static final String TASK_ACCEPT = "task_accept";
    public static final String TASK_APPLY_COMPLETE = "task_apply_complete";
    public static final String TASK_COMPLETE = "task_complete";
    public static final String SHOP_ITEM_PUBLISH = "shop_item_publish";
    public static final String ITEM_VERIFIED = "item_verified";
    public static final String REWARD_CODE_USED = "reward_code_used";
    public static final String ITEM_REDEEM = "item_redeem";

    private final SystemNoticesService systemNoticesService;
    private final BindingRelationsService bindingRelationsService;
    private final ChatWebSocketPushService chatWebSocketPushService;
    private final AuthService authService;

    public String resolvePeerUserId(String userId) {
        BindingRelations bind = bindingRelationsService.lambdaQuery()
                .and(w -> w.eq(BindingRelations::getUserId, userId).or().eq(BindingRelations::getTargetId, userId))
                .eq(BindingRelations::getStatus, BindingRelation.ACCEPTED.getValue())
                .one();
        if (bind == null) {
            return null;
        }
        return userId.equals(bind.getUserId()) ? bind.getTargetId() : bind.getUserId();
    }

    public String resolveBindId(String userId) {
        BindingRelations bind = bindingRelationsService.lambdaQuery()
                .and(w -> w.eq(BindingRelations::getUserId, userId).or().eq(BindingRelations::getTargetId, userId))
                .eq(BindingRelations::getStatus, BindingRelation.ACCEPTED.getValue())
                .one();
        return bind == null ? null : bind.getId();
    }

    @Transactional(rollbackFor = Exception.class)
    public void createAndPush(String receiverUserId, String senderUserId, String bindId, String noticeType,
                              String bizId, String title, String content, Map<String, Object> payload) {
        if (receiverUserId == null || receiverUserId.isBlank() || noticeType == null || title == null || content == null) {
            return;
        }
        SystemNotices row = new SystemNotices();
        row.setId(UUID.randomUUID().toString());
        row.setReceiverUserId(receiverUserId);
        row.setSenderUserId(senderUserId);
        row.setBindId(bindId);
        row.setNoticeType(noticeType);
        row.setBizId(bizId);
        row.setTitle(title);
        row.setContent(content);
        row.setPayload(payload == null ? null : JSON.toJSONString(payload));
        row.setIsRead(0);
        row.setCreatedAt(new Date());
        systemNoticesService.save(row);

        Map<String, Object> data = new HashMap<>(4);
        data.put("id", row.getId());
        data.put("receiverUserId", row.getReceiverUserId());
        data.put("senderUserId", row.getSenderUserId());
        data.put("bindId", row.getBindId());
        data.put("noticeType", row.getNoticeType());
        data.put("bizId", row.getBizId());
        data.put("title", row.getTitle());
        data.put("content", row.getContent());
        data.put("payload", payload);
        data.put("isRead", row.getIsRead());
        data.put("createdAt", row.getCreatedAt());
        chatWebSocketPushService.pushSystemNotice(receiverUserId, data);
    }

    public String list(String token, Long page, Long size) {
        Users user = authService.checkToken(token);
        long p = page == null || page < 1 ? 1L : page;
        long s = size == null || size < 1 ? 20L : Math.min(size, 100L);
        Page<SystemNotices> pg = systemNoticesService.lambdaQuery()
                .eq(SystemNotices::getReceiverUserId, user.getId())
                .isNull(SystemNotices::getDeletedAt)
                .orderByDesc(SystemNotices::getCreatedAt)
                .page(new Page<>(p, s));
        Map<String, Object> data = new HashMap<>(4);
        data.put("current", pg.getCurrent());
        data.put("size", pg.getSize());
        data.put("total", pg.getTotal());
        data.put("records", pg.getRecords());
        return Result.success(data).toJson();
    }

    public String unreadCount(String token) {
        Users user = authService.checkToken(token);
        long cnt = systemNoticesService.lambdaQuery()
                .eq(SystemNotices::getReceiverUserId, user.getId())
                .eq(SystemNotices::getIsRead, 0)
                .isNull(SystemNotices::getDeletedAt)
                .count();
        return Result.success(Map.of("count", cnt)).toJson();
    }

    @Transactional(rollbackFor = Exception.class)
    public String readOne(String token, String id) {
        Users user = authService.checkToken(token);
        SystemNotices row = systemNoticesService.getById(id);
        if (row == null || row.getDeletedAt() != null) {
            return Result.fail("通知不存在").toJson();
        }
        if (!user.getId().equals(row.getReceiverUserId())) {
            return Result.fail("无权操作").toJson();
        }
        row.setIsRead(1);
        row.setReadAt(new Date());
        systemNoticesService.updateById(row);
        return Result.success("已读").toJson();
    }

    @Transactional(rollbackFor = Exception.class)
    public String readAll(String token) {
        Users user = authService.checkToken(token);
        systemNoticesService.lambdaUpdate()
                .eq(SystemNotices::getReceiverUserId, user.getId())
                .eq(SystemNotices::getIsRead, 0)
                .isNull(SystemNotices::getDeletedAt)
                .set(SystemNotices::getIsRead, 1)
                .set(SystemNotices::getReadAt, new Date())
                .update();
        return Result.success("全部已读").toJson();
    }
}
