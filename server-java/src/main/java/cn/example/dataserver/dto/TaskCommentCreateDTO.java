package cn.example.dataserver.dto;

import lombok.Data;

/**
 * 创建评论DTO
 */
@Data
public class TaskCommentCreateDTO {
    /**
     * 任务ID
     */
    private String taskId;

    /**
     * 评论内容
     */
    private String content;

    /**
     * 回复评论ID
     */
    private String replyToId;
}
