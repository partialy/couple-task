package cn.example.dataserver.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import java.util.Date;
import lombok.Data;

/**
 * 会话表
 * @TableName conversations
 */
@TableName(value ="conversations")
@Data
public class Conversations implements Serializable {
    /**
     * ID，全局唯一
     */
    @TableId(value = "id")
    private String id;

    /**
     * 用户1 ID
     */
    @TableField(value = "user1_id")
    private String user1Id;

    /**
     * 用户2 ID
     */
    @TableField(value = "user2_id")
    private String user2Id;

    /**
     * 会话类型 (direct, system)
     */
    @TableField(value = "type")
    private String type;

    /**
     * 最后一条消息ID
     */
    @TableField(value = "last_message_id")
    private String lastMessageId;

    /**
     * 创建时间
     */
    @TableField(value = "created_at")
    private Date createdAt;

    /**
     * 更新时间
     */
    @TableField(value = "updated_at")
    private Date updatedAt;

    @TableField(exist = false)
    private static final long serialVersionUID = 1L;
}