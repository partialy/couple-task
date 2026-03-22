package cn.example.dataserver.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import java.util.Date;
import lombok.Data;

/**
 * 用户收藏表
 * @TableName user_favorites
 */
@TableName(value ="user_favorites")
@Data
public class UserFavorites implements Serializable {
    /**
     * 主键 UUID
     */
    @TableId(value = "id")
    private String id;

    /**
     * 用户ID
     */
    @TableField(value = "user_id")
    private String userId;

    /**
     * 收藏类型：task / shop_item / user_item / ...
     */
    @TableField(value = "target_type")
    private String targetType;

    /**
     * 被收藏对象ID（对应各业务表主键）
     */
    @TableField(value = "target_id")
    private String targetId;

    /**
     * 收藏时间
     */
    @TableField(value = "created_at")
    private Date createdAt;

    /**
     * 扩展信息（可选：标题快照、封面URL等）
     */
    @TableField(value = "extra")
    private Object extra;

    @TableField(exist = false)
    private static final long serialVersionUID = 1L;
}