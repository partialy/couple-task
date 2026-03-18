package cn.example.dataserver.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import java.util.Date;
import lombok.Data;

/**
 * 任务评论表
 * @TableName task_comments
 */
@TableName(value ="task_comments")
@Data
public class TaskComments implements Serializable {
    /**
     * ID，全局唯一
     */
    @TableId(value = "id")
    private String id;

    /**
     * 任务ID
     */
    @TableField(value = "task_id")
    private String taskId;

    /**
     * 评论者ID
     */
    @TableField(value = "user_id")
    private String userId;

    /**
     * 评论内容
     */
    @TableField(value = "content")
    private String content;

    /**
     * 回复的评论ID
     */
    @TableField(value = "reply_to_id")
    private String replyToId;

    /**
     * 评论时间
     */
    @TableField(value = "created_at")
    private Date createdAt;

    /**
     * 逻辑删除时间
     */
    @TableField(value = "deleted_at")
    private Date deletedAt;

    @TableField(exist = false)
    private static final long serialVersionUID = 1L;
}