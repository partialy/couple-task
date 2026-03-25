package cn.example.dataserver.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

/**
 * 签到计划创建/更新 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckinPlanDTO {
    /**
     * 计划名称
     */
    private String name;

    /**
     * 计划描述
     */
    private String description;

    /**
     * 图标
     */
    private String icon;

    /**
     * 颜色
     */
    private String color;

    /**
     * 周期类型：weekly | monthly
     */
    private String cycleType;

    /**
     * 是否连续签到（0=非连续，1=连续）
     */
    private Integer isConsecutive;

    /**
     * 可签到时段列表
     */
    private List<TimeWindow> timeWindows;

    /**
     * 每日奖励配置列表
     */
    private List<DayRewardItem> dayRewards;

    /**
     * 时间窗口
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimeWindow {
        private String start;
        private String end;
    }

    /**
     * 单条奖励配置
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DayRewardItem {
        private Integer dayNumber;
        private String rewardType;
        private String rewardName;
        private Integer rewardAmount;
        private String description;
        private String icon;
        private String color;
    }
}
