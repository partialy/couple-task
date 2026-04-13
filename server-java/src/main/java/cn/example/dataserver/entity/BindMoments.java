package cn.example.dataserver.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import java.util.Date;
import lombok.Data;

@Data
@TableName(value = "bind_moments")
public class BindMoments implements Serializable {

    @TableId(value = "id")
    private String id;

    @TableField(value = "bind_id")
    private String bindId;

    @TableField(value = "author_user_id")
    private String authorUserId;

    @TableField(value = "content")
    private String content;

    @TableField(value = "biz_uuid")
    private String bizUuid;

    @TableField(value = "biz_scene")
    private String bizScene;

    @TableField(value = "remark")
    private String remark;

    @TableField(value = "created_at")
    private Date createdAt;

    @TableField(value = "updated_at")
    private Date updatedAt;

    @TableField(value = "deleted_at")
    private Date deletedAt;
}
