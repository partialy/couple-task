package cn.example.dataserver.dto;

import cn.example.dataserver.entity.Users;
import lombok.Builder;
import lombok.Data;

/**
 * 绑定对象资料页汇总（任务 / 道具 / 资产等）
 */
@Builder
@Data
public class PartnerOverviewDTO {
    /** 对方公开资料（password 已清空） */
    private Users profile;

    /** 积分 */
    private Integer points;
    /** 万能卡 */
    private Integer cards;

    /** 作为发布者的任务数 */
    private Long tasksPublished;
    /** 作为接收者且已完成 */
    private Long tasksReceivedCompleted;
    /** 作为接收者进行中（accepted / in-progress） */
    private Long tasksReceivedOngoing;
    /** 作为接收者待接取 */
    private Long tasksReceivedPending;

    /** 背包中可使用道具数 */
    private Long usableItemCount;
    /** 在当前绑定下发布的特别奖励条数 */
    private Long specialRewardsPublished;
}
