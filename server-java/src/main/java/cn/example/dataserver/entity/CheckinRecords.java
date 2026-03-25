package cn.example.dataserver.entity;

import com.baomidou.mybatisplus.annotation.IdType;
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
 * 签到打卡记录表
 * @TableName checkin_records
 */
@TableName(value = "checkin_records")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckinRecords implements Serializable {
    /**
     * ID，自增
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;

    /**
     * 关联 checkin_plans.id
     */
    @TableField(value = "plan_id")
    private String planId;

    /**
     * 签到用户ID
     */
    @TableField(value = "user_id")
    private String userId;

    /**
     * 签到日期（去重用）
     */
    @TableField(value = "checkin_date")
    private Date checkinDate;

    /**
     * 领取的是第几天奖励
     */
    @TableField(value = "day_number")
    private Integer dayNumber;

    /**
     * 第几个周期轮次
     */
    @TableField(value = "cycle_number")
    private Integer cycleNumber;

    /**
     * 本次签到时的连续天数
     */
    @TableField(value = "streak_count")
    private Integer streakCount;

    /**
     * 实际签到时间
     */
    @TableField(value = "checkin_at")
    private Date checkinAt;

    @TableField(exist = false)
    private static final long serialVersionUID = 1L;
}
