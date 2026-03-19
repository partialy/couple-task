package cn.example.dataserver.vo;

import lombok.Builder;
import lombok.Data;

import java.util.Date;

/**
 * 任务评论VO
 */
@Data
@Builder
public class TaskCommentVO {
    /**
     * 评论ID
     */
    private String id;

    /**
     * 任务ID
     */
    private String taskId;

    /**
     * 评论用户ID
     */
    private String userId;

    /**
     * 评论内容
     */
    private String content;

    /**
     * 回复评论ID
     */
    private String replyToId;

    /**
     * 评论时间
     */
    private Date createdAt;

    /**
     * 评论人昵称
     */
    private String userName;

    /**
     * 评论人头像
     */
    private String userAvatar;
}
