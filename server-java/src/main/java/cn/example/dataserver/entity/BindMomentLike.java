package cn.example.dataserver.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import java.util.Date;
import lombok.Data;

@Data
@TableName(value = "bind_moment_likes")
public class BindMomentLike implements Serializable {

    @TableId(value = "id")
    private String id;

    @TableField(value = "moment_id")
    private String momentId;

    @TableField(value = "user_id")
    private String userId;

    @TableField(value = "created_at")
    private Date createdAt;
}
