package cn.example.dataserver.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import java.util.Date;
import lombok.Data;

@Data
@TableName(value = "bind_moment_comments")
public class BindMomentComment implements Serializable {

    @TableId(value = "id")
    private String id;

    @TableField(value = "moment_id")
    private String momentId;

    @TableField(value = "author_user_id")
    private String authorUserId;

    @TableField(value = "content")
    private String content;

    @TableField(value = "created_at")
    private Date createdAt;

    @TableField(value = "deleted_at")
    private Date deletedAt;
}
