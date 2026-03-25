package cn.example.dataserver.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import java.util.Date;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * 签到计划配置表
 * @TableName checkin_plans
 */
@TableName(value = "checkin_plans")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckinPlans implements Serializable {
    /**
     * ID，全局唯一
     */
    @TableId(value = "id")
    private String id;

    /**
     * 属于绑定id（关联绑定表的id）
     */
    @TableField(value = "belong_binding_id")
    private String belongBindingId;

    /**
     * 配置者（给对方配签到的人）
     */
    @TableField(value = "creator_id")
    private String creatorId;

    /**
     * 签到执行者（需要打卡的人）
     */
    @TableField(value = "target_user_id")
    private String targetUserId;

    /**
     * 计划名称
     */
    @TableField(value = "name")
    private String name;

    /**
     * 计划描述
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
     * 周期类型：weekly | monthly
     */
    @TableField(value = "cycle_type")
    private String cycleType;

    /**
     * 周期天数：7 或 30
     */
    @TableField(value = "cycle_days")
    private Integer cycleDays;

    /**
     * 是否连续签到（0=非连续，1=连续断签重置）
     */
    @TableField(value = "is_consecutive")
    private Integer isConsecutive;

    /**
     * 可签到时段 JSON，如 [{"start":"08:00","end":"12:00"}]
     */
    @TableField(value = "time_windows")
    private Object timeWindows;

    /**
     * 状态：active | inactive
     */
    @TableField(value = "status")
    private String status;

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
