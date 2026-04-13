package cn.example.dataserver.utils;

import cn.example.dataserver.entity.TaskRewards;
import cn.example.dataserver.entity.Tasks;
import cn.example.dataserver.enums.RewardType;
import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.util.StrUtil;
import java.util.ArrayList;
import java.util.List;

/**
 * 任务相关「我们的动态」文案
 */
public final class TaskMomentCopyHelper {

    private TaskMomentCopyHelper() {
    }

    public static String publishContent(Tasks task) {
        String title = task.getTitle() == null ? "" : task.getTitle().trim();
        return "我发布了任务【" + title + "】";
    }

    public static String acceptContent(Tasks task) {
        String title = task.getTitle() == null ? "" : task.getTitle().trim();
        return "我接取了任务【" + title + "】";
    }

    /**
     * 与 TaskServiceImplements.completeTask 奖励类型展示对齐
     */
    public static String rewardSummaryText(List<TaskRewards> rewards) {
        if (CollUtil.isEmpty(rewards)) {
            return "未配置奖励";
        }
        List<String> parts = new ArrayList<>();
        for (TaskRewards r : rewards) {
            Integer amt = r.getAmount() == null ? 0 : r.getAmount();
            if (RewardType.POINTS.getValue().equals(r.getType()) && amt > 0) {
                parts.add(amt + " 积分");
            } else if (RewardType.WILD_CARD.getValue().equals(r.getType()) && amt > 0) {
                parts.add(amt + " 张万能卡");
            } else if (RewardType.NORMAL.getValue().equals(r.getType())) {
                String name = StrUtil.blankToDefault(r.getContent(), "道具");
                if (amt > 1) {
                    parts.add(name + "×" + amt);
                } else {
                    parts.add(name);
                }
            } else if (RewardType.SPECIAL.getValue().equals(r.getType())) {
                String desc = StrUtil.isNotBlank(r.getDescription()) ? r.getDescription() : r.getContent();
                parts.add(StrUtil.blankToDefault(desc, "特别奖励"));
            }
        }
        if (parts.isEmpty()) {
            return "未配置奖励";
        }
        return String.join("、", parts);
    }

    public static String completeContent(Tasks task, List<TaskRewards> rewards) {
        String title = task.getTitle() == null ? "" : task.getTitle().trim();
        return "我完成了【" + title + "】任务，获得了" + rewardSummaryText(rewards);
    }
}
