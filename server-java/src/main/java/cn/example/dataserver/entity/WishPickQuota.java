package cn.example.dataserver.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import java.util.Date;
import lombok.Data;

/**
 * 心愿摘取次数（每人每绑定一行）
 */
@TableName(value = "wish_pick_quota")
@Data
public class WishPickQuota implements Serializable {

    @TableId(value = "id")
    private String id;

    @TableField(value = "bind_id")
    private String bindId;

    @TableField(value = "user_id")
    private String userId;

    @TableField(value = "pick_chances")
    private Integer pickChances;

    @TableField(value = "updated_at")
    private Date updatedAt;

    @TableField(exist = false)
    private static final long serialVersionUID = 1L;
}
