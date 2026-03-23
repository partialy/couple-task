package cn.example.dataserver.dto;

import lombok.Data;

import java.util.Date;

/**
 * 会话列表联表查询行（供 ChatMapper 使用）
 */
@Data
public class ConversationListRow {

    private String conversationId;
    private String user1Id;
    private String user2Id;
    private String conversationType;
    private String lastMessageId;
    private Date createdAt;
    private Date updatedAt;
    private String peerId;
    private String peerNickname;
    private String peerAvatar;
    private String lastContent;
    private String lastType;
    private Date lastMessageCreatedAt;
    private Long unreadCount;
}
