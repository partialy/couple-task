package cn.example.dataserver.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * 签到每日奖励配置表
 * @TableName checkin_day_rewards
 */
@TableName(value = "checkin_day_rewards")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckinDayRewards implements Serializable {
    /**
     * ID，全局唯一
     */
    @TableId(value = "id")
    private String id;

    /**
     * 关联 checkin_plans.id
     */
    @TableField(value = "plan_id")
    private String planId;

    /**
     * 第几天的奖励，1-7 或 1-30
     */
    @TableField(value = "day_number")
    private Integer dayNumber;

    /**
     * 奖励类型：points | wild_card | prop
     */
    @TableField(value = "reward_type")
    private String rewardType;

    /**
     * 奖励名称；prop 自定义填写，points/wild_card 可为空
     */
    @TableField(value = "reward_name")
    private String rewardName;

    /**
     * 奖励数量
     */
    @TableField(value = "reward_amount")
    private Integer rewardAmount;

    /**
     * 奖励描述
     */
    @TableField(value = "description")
    private String description;

    /**
     * Lucide 图标 key 或图片 URL
     */
    @TableField(value = "icon")
    private String icon;

    /**
     * 颜色标识
     */
    @TableField(value = "color")
    private String color;

    /**
     * 排序权重
     */
    @TableField(value = "sort_order")
    private Integer sortOrder;

    @TableField(exist = false)
    private static final long serialVersionUID = 1L;
}
