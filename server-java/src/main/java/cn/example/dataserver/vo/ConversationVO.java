package cn.example.dataserver.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

/**
 * 会话列表项
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationVO {

    private String id;
    private PeerUserVO peerUser;
    private LastMessagePreviewVO lastMessage;
    private Long unreadCount;
    private Date updatedAt;
}
