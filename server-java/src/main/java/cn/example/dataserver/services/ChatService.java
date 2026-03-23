package cn.example.dataserver.services;

import cn.example.dataserver.common.BusinessException;
import cn.example.dataserver.common.Result;
import cn.example.dataserver.constant.ChatMessageConstants;
import cn.example.dataserver.dto.ChatReadDTO;
import cn.example.dataserver.dto.ChatSendDTO;
import cn.example.dataserver.dto.ConversationListRow;
import cn.example.dataserver.entity.BindingRelations;
import cn.example.dataserver.entity.Conversations;
import cn.example.dataserver.entity.Messages;
import cn.example.dataserver.entity.Users;
import cn.example.dataserver.enums.BindingRelation;
import cn.example.dataserver.mapper.ChatMapper;
import cn.example.dataserver.service.BindingRelationsService;
import cn.example.dataserver.service.ConversationsService;
import cn.example.dataserver.service.MessagesService;
import cn.example.dataserver.service.UsersService;
import cn.example.dataserver.utils.ChatUserPairUtil;
import cn.example.dataserver.vo.ConversationVO;
import cn.example.dataserver.vo.LastMessagePreviewVO;
import cn.example.dataserver.vo.MessageVO;
import cn.example.dataserver.vo.PeerUserVO;
import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 聊天：会话、消息、已读与实时推送
 */
@Service
@RequiredArgsConstructor
public class ChatService {

    private static final Set<String> ALLOWED_MESSAGE_TYPES = new HashSet<>();

    static {
        ALLOWED_MESSAGE_TYPES.add(ChatMessageConstants.TYPE_TEXT);
        ALLOWED_MESSAGE_TYPES.add(ChatMessageConstants.TYPE_IMAGE);
        ALLOWED_MESSAGE_TYPES.add(ChatMessageConstants.TYPE_VIDEO);
        ALLOWED_MESSAGE_TYPES.add(ChatMessageConstants.TYPE_FILE);
        ALLOWED_MESSAGE_TYPES.add(ChatMessageConstants.TYPE_TASK_INVITE);
    }

    private final ChatMapper chatMapper;
    private final ConversationsService conversationsService;
    private final MessagesService messagesService;
    private final UsersService usersService;
    private final BindingRelationsService bindingRelationsService;
    private final ChatWebSocketPushService chatWebSocketPushService;

    /**
     * 分页查询当前用户的会话列表；若为空且存在已绑定伙伴则自动创建会话后再查（兼容历史用户无会话记录）
     */
    @Transactional(rollbackFor = Exception.class)
    public String listConversations(Users user, Long page, Long size) {
        long pageNo = page == null || page < 1 ? 1L : page;
        long pageSize = size == null || size < 1 ? 10L : Math.min(size, 50L);

        Page<ConversationListRow> pageParam = new Page<>(pageNo, pageSize);
        IPage<ConversationListRow> result = chatMapper.selectConversationPage(pageParam, user.getId());

        if (result.getTotal() == 0) {
            String peerId = findAcceptedBindingPeerUserId(user.getId());
            if (StrUtil.isNotBlank(peerId)) {
                ensureConversationBetweenUsers(user.getId(), peerId);
                result = chatMapper.selectConversationPage(pageParam, user.getId());
            }
        }

        List<ConversationVO> records = result.getRecords().stream()
                .map(this::rowToConversationVo)
                .collect(Collectors.toList());

        Map<String, Object> pageData = new HashMap<>(8);
        pageData.put("current", result.getCurrent());
        pageData.put("size", result.getSize());
        pageData.put("total", result.getTotal());
        pageData.put("records", records);
        return Result.success(pageData).toJson();
    }

    /**
     * 确保两人之间存在一条 direct 会话（已绑定场景下调用，不做绑定校验）
     */
    public void ensureConversationBetweenUsers(String userIdA, String userIdB) {
        if (StrUtil.hasBlank(userIdA, userIdB) || userIdA.equals(userIdB)) {
            return;
        }
        getOrCreateConversationEntity(userIdA, userIdB);
    }

    /**
     * 查询当前用户已接受绑定关系中的对方用户 ID，若无则返回 null
     */
    public String findAcceptedBindingPeerUserId(String userId) {
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

    /**
     * 与指定用户获取或创建会话
     */
    @Transactional(rollbackFor = Exception.class)
    public String getOrCreateWithPeer(Users user, String peerUserId) {
        if (StrUtil.isBlank(peerUserId)) {
            throw new BusinessException("对方用户 ID 不能为空");
        }
        if (peerUserId.equals(user.getId())) {
            throw new BusinessException("不能与自己聊天");
        }
        Users peer = usersService.getById(peerUserId);
        if (peer == null) {
            throw new BusinessException("对方用户不存在");
        }
        assertAcceptedBinding(user.getId(), peerUserId);

        Conversations conv = getOrCreateConversationEntity(user.getId(), peerUserId);
        ConversationVO vo = buildConversationVoForSingle(user.getId(), conv);
        return Result.success(vo).toJson();
    }

    /**
     * 分页拉取会话内消息（按时间倒序，第一页为最新）
     */
    public String listMessages(Users user, String conversationId, Long page, Long size) {
        if (StrUtil.isBlank(conversationId)) {
            throw new BusinessException("会话 ID 不能为空");
        }
        Conversations conv = conversationsService.getById(conversationId);
        if (conv == null) {
            throw new BusinessException("会话不存在");
        }
        assertMember(conv, user.getId());

        long pageNo = page == null || page < 1 ? 1L : page;
        long pageSize = size == null || size < 1 ? 20L : Math.min(size, 100L);

        Page<Messages> pageResult = messagesService.lambdaQuery()
                .eq(Messages::getConversationId, conversationId)
                .orderByDesc(Messages::getCreatedAt)
                .page(new Page<>(pageNo, pageSize));

        List<MessageVO> records = pageResult.getRecords().stream()
                .map(this::toMessageVo)
                .collect(Collectors.toList());

        Map<String, Object> pageData = new HashMap<>(8);
        pageData.put("current", pageResult.getCurrent());
        pageData.put("size", pageResult.getSize());
        pageData.put("total", pageResult.getTotal());
        pageData.put("records", records);
        return Result.success(pageData).toJson();
    }

    /**
     * 发送消息并推送给对方（若在线）
     */
    @Transactional(rollbackFor = Exception.class)
    public String sendMessage(Users user, ChatSendDTO dto) {
        if (dto == null || StrUtil.isBlank(dto.getConversationId())) {
            throw new BusinessException("会话 ID 不能为空");
        }
        if (StrUtil.isBlank(dto.getType()) || !ALLOWED_MESSAGE_TYPES.contains(dto.getType())) {
            throw new BusinessException("不支持的消息类型");
        }
        if (StrUtil.isBlank(dto.getContent())) {
            throw new BusinessException("消息内容不能为空");
        }

        Conversations conv = conversationsService.getById(dto.getConversationId());
        if (conv == null) {
            throw new BusinessException("会话不存在");
        }
        assertMember(conv, user.getId());
        String peerId = getPeerUserId(conv, user.getId());
        assertAcceptedBinding(user.getId(), peerId);

        Messages msg = new Messages();
        msg.setId(UUID.randomUUID().toString());
        msg.setConversationId(conv.getId());
        msg.setSenderId(user.getId());
        msg.setContent(dto.getContent().trim());
        msg.setType(dto.getType());
        msg.setIsRead(0);
        msg.setCreatedAt(new Date());
        messagesService.save(msg);

        conv.setLastMessageId(msg.getId());
        conv.setUpdatedAt(new Date());
        conversationsService.updateById(conv);

        MessageVO vo = toMessageVo(msg);
        chatWebSocketPushService.pushNewMessage(peerId, vo);
        return Result.success(vo).toJson();
    }

    /**
     * 将对方发来的未读消息标记为已读
     */
    @Transactional(rollbackFor = Exception.class)
    public String markRead(Users user, ChatReadDTO dto) {
        if (dto == null || StrUtil.isBlank(dto.getConversationId())) {
            throw new BusinessException("会话 ID 不能为空");
        }
        Conversations conv = conversationsService.getById(dto.getConversationId());
        if (conv == null) {
            throw new BusinessException("会话不存在");
        }
        assertMember(conv, user.getId());

        messagesService.lambdaUpdate()
                .eq(Messages::getConversationId, dto.getConversationId())
                .ne(Messages::getSenderId, user.getId())
                .eq(Messages::getIsRead, 0)
                .set(Messages::getIsRead, 1)
                .update();

        return Result.success("已更新").toJson();
    }

    private void assertAcceptedBinding(String userIdA, String userIdB) {
        long n = bindingRelationsService.lambdaQuery()
                .eq(BindingRelations::getStatus, BindingRelation.ACCEPTED.getValue())
                .and(w -> w
                        .eq(BindingRelations::getUserId, userIdA)
                        .eq(BindingRelations::getTargetId, userIdB)
                        .or(w2 -> w2
                                .eq(BindingRelations::getUserId, userIdB)
                                .eq(BindingRelations::getTargetId, userIdA)))
                .count();
        if (n == 0) {
            throw new BusinessException("仅已绑定伙伴可私聊");
        }
    }

    private void assertMember(Conversations conv, String userId) {
        if (!userId.equals(conv.getUser1Id()) && !userId.equals(conv.getUser2Id())) {
            throw new BusinessException("无权访问该会话");
        }
    }

    private String getPeerUserId(Conversations conv, String myUserId) {
        return myUserId.equals(conv.getUser1Id()) ? conv.getUser2Id() : conv.getUser1Id();
    }

    /**
     * 规范化 user1/user2 后查找或创建会话（已校验绑定）
     */
    private Conversations getOrCreateConversationEntity(String myUserId, String peerUserId) {
        String[] pair = ChatUserPairUtil.orderedPair(myUserId, peerUserId);
        Conversations existing = conversationsService.lambdaQuery()
                .eq(Conversations::getUser1Id, pair[0])
                .eq(Conversations::getUser2Id, pair[1])
                .one();
        if (existing != null) {
            return existing;
        }
        Date now = new Date();
        Conversations c = new Conversations();
        c.setId(UUID.randomUUID().toString());
        c.setUser1Id(pair[0]);
        c.setUser2Id(pair[1]);
        c.setType("direct");
        c.setLastMessageId(null);
        c.setCreatedAt(now);
        c.setUpdatedAt(now);
        conversationsService.save(c);
        return c;
    }

    private ConversationVO buildConversationVoForSingle(String myUserId, Conversations conv) {
        String peerId = getPeerUserId(conv, myUserId);
        Users peer = usersService.getById(peerId);
        PeerUserVO peerVo = PeerUserVO.builder()
                .id(peerId)
                .nickname(peer != null ? peer.getNickname() : null)
                .avatar(peer != null ? peer.getAvatar() : null)
                .build();

        LastMessagePreviewVO last = null;
        if (StrUtil.isNotBlank(conv.getLastMessageId())) {
            Messages m = messagesService.getById(conv.getLastMessageId());
            if (m != null) {
                last = LastMessagePreviewVO.builder()
                        .content(m.getContent())
                        .type(m.getType())
                        .createdAt(m.getCreatedAt())
                        .build();
            }
        }

        long unread = messagesService.lambdaQuery()
                .eq(Messages::getConversationId, conv.getId())
                .ne(Messages::getSenderId, myUserId)
                .eq(Messages::getIsRead, 0)
                .count();

        return ConversationVO.builder()
                .id(conv.getId())
                .peerUser(peerVo)
                .lastMessage(last)
                .unreadCount(unread)
                .updatedAt(conv.getUpdatedAt())
                .build();
    }

    private ConversationVO rowToConversationVo(ConversationListRow r) {
        PeerUserVO peer = PeerUserVO.builder()
                .id(r.getPeerId())
                .nickname(r.getPeerNickname())
                .avatar(r.getPeerAvatar())
                .build();
        LastMessagePreviewVO last = null;
        if (StrUtil.isNotBlank(r.getLastContent())) {
            last = LastMessagePreviewVO.builder()
                    .content(r.getLastContent())
                    .type(r.getLastType())
                    .createdAt(r.getLastMessageCreatedAt())
                    .build();
        }
        long unread = r.getUnreadCount() != null ? r.getUnreadCount() : 0L;
        return ConversationVO.builder()
                .id(r.getConversationId())
                .peerUser(peer)
                .lastMessage(last)
                .unreadCount(unread)
                .updatedAt(r.getUpdatedAt())
                .build();
    }

    private MessageVO toMessageVo(Messages m) {
        return MessageVO.builder()
                .id(m.getId())
                .conversationId(m.getConversationId())
                .senderId(m.getSenderId())
                .content(m.getContent())
                .type(m.getType())
                .isRead(m.getIsRead())
                .createdAt(m.getCreatedAt())
                .build();
    }
}
