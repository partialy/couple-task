package cn.example.dataserver.dto;

import lombok.Data;

/**
 * 发送聊天消息请求体
 */
@Data
public class ChatSendDTO {

    /**
     * 会话 ID
     */
    private String conversationId;

    /**
     * 消息类型：text / image / video / file / task_invite
     */
    private String type;

    /**
     * 文本内容或七牛资源 URL
     */
    private String content;
}
