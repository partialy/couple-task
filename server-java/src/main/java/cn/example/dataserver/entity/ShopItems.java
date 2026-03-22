package cn.example.dataserver.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import java.util.Date;
import lombok.Data;

/**
 * 商店商品表
 * @TableName shop_items
 */
@TableName(value ="shop_items")
@Data
public class ShopItems implements Serializable {
    /**
     * ID，全局唯一
     */
    @TableId(value = "id")
    private String id;

    /**
     * 商品名称
     */
    @TableField(value = "name")
    private String name;

    /**
     * 商品描述
     */
    @TableField(value = "description")
    private String description;

    /**
     * 道具类型 (prop, wildcard, other)
     */
    @TableField(value = "item_type")
    private String itemType;

    /**
     * 兑换所需积分
     */
    @TableField(value = "points_cost")
    private Integer pointsCost;

    /**
     * Lucide 图标 key 或图片 URL（前端按 http(s) 区分）
     */
    @TableField(value = "icon")
    private String icon;

    /**
     * 颜色样式
     */
    @TableField(value = "color")
    private String color;

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

    /**
     * 所属绑定ID
     */
    @TableField(value = "belong_binding_id")
    private String belongBindingId;

    /**
     * 所属用户ID
     */
    @TableField(value = "belong_user_id")
    private String belongUserId;

    /**
     * 发布者ID
     */
    @TableField(value = "publish_user_id")
    private String publishUserId;

    /**
     * 排序权重
     */
    @TableField(value = "sort_order")
    private Integer sortOrder;

    @TableField(exist = false)
    private static final long serialVersionUID = 1L;
}