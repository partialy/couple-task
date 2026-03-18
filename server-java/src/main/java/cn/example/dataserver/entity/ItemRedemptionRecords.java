package cn.example.dataserver.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import java.util.Date;
import lombok.Data;

/**
 * 道具核销记录表
 * @TableName item_redemption_records
 */
@TableName(value ="item_redemption_records")
@Data
public class ItemRedemptionRecords implements Serializable {
    /**
     * ID，全局唯一
     */
    @TableId(value = "id")
    private String id;

    /**
     * 核销物品类型 (normal_item, special_item)
     */
    @TableField(value = "item_type")
    private String itemType;

    /**
     * 用户道具实例ID (user_items.id 或 user_special_items.id)
     */
    @TableField(value = "instance_id")
    private String instanceId;

    /**
     * 道具所有者ID
     */
    @TableField(value = "owner_id")
    private String ownerId;

    /**
     * 核销者ID
     */
    @TableField(value = "redeemer_id")
    private String redeemerId;

    /**
     * 核销码
     */
    @TableField(value = "code")
    private String code;

    /**
     * 核销备注
     */
    @TableField(value = "remark")
    private String remark;

    /**
     * 核销时间
     */
    @TableField(value = "created_at")
    private Date createdAt;

    @TableField(exist = false)
    private static final long serialVersionUID = 1L;
}