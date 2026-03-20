package cn.example.dataserver.dto;

import lombok.Data;

/**
 * 发布兑换码参数
 */
@Data
public class RewardCodePublishDTO {
    /**
     * 奖励名称
     */
    private String rewardName;

    /**
     * 奖励类型（prop、points、wild_card）
     */
    private String rewardType;

    /**
     * 数量或额度
     */
    private Integer rewardCount;

    /**
     * 图标标识
     */
    private String icon;

    /**
     * 颜色
     */
    private String color;

    /**
     * 自定义图片地址
     */
    private String imageUrl;

    /**
     * 描述（可选）
     */
    private String description;
}
