package cn.example.dataserver.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import java.util.Date;
import lombok.Data;

@Data
@TableName(value = "system_notices")
public class SystemNotices implements Serializable {

    @TableId(value = "id")
    private String id;

    @TableField(value = "receiver_user_id")
    private String receiverUserId;

    @TableField(value = "sender_user_id")
    private String senderUserId;

    @TableField(value = "bind_id")
    private String bindId;

    @TableField(value = "notice_type")
    private String noticeType;

    @TableField(value = "biz_id")
    private String bizId;

    @TableField(value = "title")
    private String title;

    @TableField(value = "content")
    private String content;

    @TableField(value = "payload")
    private String payload;

    @TableField(value = "is_read")
    private Integer isRead;

    @TableField(value = "read_at")
    private Date readAt;

    @TableField(value = "created_at")
    private Date createdAt;

    @TableField(value = "deleted_at")
    private Date deletedAt;
}
