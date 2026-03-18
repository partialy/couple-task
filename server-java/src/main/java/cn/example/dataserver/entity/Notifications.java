package cn.example.dataserver.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import java.util.Date;
import lombok.Data;

/**
 * 系统通知表
 * @TableName notifications
 */
@TableName(value ="notifications")
@Data
public class Notifications implements Serializable {
    /**
     * ID，全局唯一
     */
    @TableId(value = "id")
    private String id;

    /**
     * 接收用户ID
     */
    @TableField(value = "user_id")
    private String userId;

    /**
     * 通知标题
     */
    @TableField(value = "title")
    private String title;

    /**
     * 通知内容
     */
    @TableField(value = "content")
    private String content;

    /**
     * 通知类型 (task_update, system, reward)
     */
    @TableField(value = "type")
    private String type;

    /**
     * 关联业务ID
     */
    @TableField(value = "reference_id")
    private String referenceId;

    /**
     * 是否已读
     */
    @TableField(value = "is_read")
    private Integer isRead;

    /**
     * 创建时间
     */
    @TableField(value = "created_at")
    private Date createdAt;

    @TableField(exist = false)
    private static final long serialVersionUID = 1L;
}