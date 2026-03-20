package cn.example.dataserver.dto;

import lombok.Data;
import java.util.List;

/**
 * 任务发布DTO
 */
@Data
public class TaskDTO {
    private String title;          // 任务标题
    private String description;    // 任务描述
    private String category;       // 任务分类名称
    private String level;          // 任务等级名称
    private String categoryId;     // 任务分类ID
    private String levelId;        // 任务等级ID
    private String deadline;       // 截止日期
    private String coverImage;     // 封面图
    private List<String> otherImages; // 其他图片
    private List<String> tags;     // 标签
    private List<RewardDTO> rewards; // 奖励列表
    private Boolean isPrivate;     // 是否私密
    private Boolean isPrivileged;  // 是否加急
    private String taskType;       // 任务类型 (one-time, daily, weekly, monthly)
    private String repeatConfig;   // 重复配置 (JSON字符串)

    @Data
    public static class RewardDTO {
        private String text;       // 奖励内容
        private String color;      // 颜色
        private String icon;       // 图标
        private String type;        // 类型points、wild_card、normal
        private Integer amount;    // 数量
    }
}
