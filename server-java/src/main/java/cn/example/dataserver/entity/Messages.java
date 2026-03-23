package cn.example.dataserver.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import java.util.Date;
import lombok.Data;

/**
 * 消息表
 * @TableName messages
 */
@TableName(value ="messages")
@Data
public class Messages implements Serializable {
    /**
     * ID，全局唯一
     */
    @TableId(value = "id")
    private String id;

    /**
     * 所属会话ID
     */
    @TableField(value = "conversation_id")
    private String conversationId;

    /**
     * 发送者ID (系统消息可为system)
     */
    @TableField(value = "sender_id")
    private String senderId;

    /**
     * 消息内容
     */
    @TableField(value = "content")
    private String content;

    /**
     * 消息类型：text、image、video、file、task_invite 等
     */
    @TableField(value = "type")
    private String type;

    /**
     * 是否已读
     */
    @TableField(value = "is_read")
    private Integer isRead;

    /**
     * 发送时间
     */
    @TableField(value = "created_at")
    private Date createdAt;

    @TableField(exist = false)
    private static final long serialVersionUID = 1L;
}