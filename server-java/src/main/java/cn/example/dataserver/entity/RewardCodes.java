package cn.example.dataserver.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import java.util.Date;
import lombok.Data;

/**
 * 奖励兑换码表
 * @TableName reward_codes
 */
@TableName(value ="reward_codes")
@Data
public class RewardCodes implements Serializable {
    /**
     * ID，全局唯一
     */
    @TableId(value = "id")
    private String id;

    /**
     * 兑换码
     */
    @TableField(value = "code")
    private String code;

    /**
     * 奖励类型 (prop, points, special)
     */
    @TableField(value = "reward_type")
    private String rewardType;

    /**
     * 奖励名称
     */
    @TableField(value = "reward_name")
    private String rewardName;

    /**
     * 奖励数量
     */
    @TableField(value = "reward_count")
    private Integer rewardCount;

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
     * 创建者ID
     */
    @TableField(value = "creator_id")
    private String creatorId;

    /**
     * 状态 (unused, used, voided)
     */
    @TableField(value = "status")
    private String status;

    /**
     * 兑换者ID
     */
    @TableField(value = "redeemer_id")
    private String redeemerId;

    /**
     * 兑换时间
     */
    @TableField(value = "redeemed_at")
    private Date redeemedAt;

    /**
     * 创建时间
     */
    @TableField(value = "created_at")
    private Date createdAt;

    @TableField(exist = false)
    private static final long serialVersionUID = 1L;
}