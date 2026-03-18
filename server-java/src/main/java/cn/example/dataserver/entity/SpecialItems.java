package cn.example.dataserver.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import java.util.Date;
import lombok.Data;

/**
 * 特别奖励表
 * @TableName special_items
 */
@TableName(value ="special_items")
@Data
public class SpecialItems implements Serializable {
    /**
     * ID，全局唯一
     */
    @TableId(value = "id")
    private String id;

    /**
     * 奖励名称
     */
    @TableField(value = "name")
    private String name;

    /**
     * 奖励描述
     */
    @TableField(value = "description")
    private String description;

    /**
     * 兑换所需万能卡数量
     */
    @TableField(value = "cards_cost")
    private Integer cardsCost;

    /**
     * 图标
     */
    @TableField(value = "icon")
    private String icon;

    /**
     * 颜色样式
     */
    @TableField(value = "color")
    private String color;

    /**
     * 自定义图片
     */
    @TableField(value = "image_url")
    private String imageUrl;

    /**
     * 状态 (active, inactive)
     */
    @TableField(value = "status")
    private String status;

    /**
     * 库存数量，-1为不限量
     */
    @TableField(value = "stock")
    private Integer stock;

    /**
     * 乐观锁版本号
     */
    @TableField(value = "version")
    private Integer version;

    /**
     * 所属绑定ID
     */
    @TableField(value = "belong_binding_id")
    private String belongBindingId;

    /**
     * 发布者ID
     */
    @TableField(value = "publish_user_id")
    private String publishUserId;

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

    /**
     * 逻辑删除时间
     */
    @TableField(value = "deleted_at")
    private Date deletedAt;

    @TableField(exist = false)
    private static final long serialVersionUID = 1L;
}