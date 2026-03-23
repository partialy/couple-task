package cn.example.dataserver.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

/**
 * 聊天消息返回体
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageVO {

    private String id;
    private String conversationId;
    private String senderId;
    private String content;
    private String type;
    private Integer isRead;
    private Date createdAt;
}
