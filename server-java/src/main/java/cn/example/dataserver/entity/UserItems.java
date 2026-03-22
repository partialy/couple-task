package cn.example.dataserver.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import java.util.Date;
import lombok.Data;

/**
 * 用户道具/背包表
 * @TableName user_items
 */
@TableName(value ="user_items")
@Data
public class UserItems implements Serializable {
    /**
     * ID，全局唯一
     */
    @TableId(value = "id")
    private String id;

    /**
     * 用户ID
     */
    @TableField(value = "user_id")
    private String userId;

    /**
     * 商品ID
     */
    @TableField(value = "item_id")
    private String itemId;

    /**
     * 状态 (usable, used)
     */
    @TableField(value = "status")
    private String status;

    /**
     * 核销码
     */
    @TableField(value = "code")
    private String code;

    /**
     * 获得时间
     */
    @TableField(value = "acquired_at")
    private Date acquiredAt;

    /**
     * 核销时间
     */
    @TableField(value = "used_at")
    private Date usedAt;

    /**
     * 名称
     */
    @TableField(value = "name")
    private String name;

    /**
     * 描述
     */
    @TableField(value = "description")
    private String description;

    /**
     * 图标
     */
    @TableField(value = "icon")
    private String icon;

    /**
     * 类型
     */
    @TableField(value = "type")
    private String type;

    /**
     * 颜色
     */
    @TableField(value = "color")
    private String color;

    /**
     * 
     */
    @TableField(value = "is_special")
    private Integer isSpecial;

    @TableField(exist = false)
    private static final long serialVersionUID = 1L;
}