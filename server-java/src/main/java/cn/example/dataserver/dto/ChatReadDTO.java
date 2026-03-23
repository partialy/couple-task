package cn.example.dataserver.dto;

import lombok.Data;

/**
 * 标记会话已读请求体
 */
@Data
public class ChatReadDTO {

    /**
     * 会话 ID
     */
    private String conversationId;
}
