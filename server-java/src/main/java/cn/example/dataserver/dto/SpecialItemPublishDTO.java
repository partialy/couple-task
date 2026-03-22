package cn.example.dataserver.dto;

import lombok.Data;

/**
 * 发布或更新特别奖励参数
 */
@Data
public class SpecialItemPublishDTO {

    /**
     * 奖励名称
     */
    private String name;

    /**
     * 奖励描述
     */
    private String description;

    /**
     * 兑换所需万能卡数量
     */
    private Integer cardsCost;

    /**
     * 图标标识
     */
    private String icon;

    /**
     * 颜色预设键（如 indigo）
     */
    private String color;

    /**
     * 自定义图片地址
     */
    private String imageUrl;

    /**
     * 库存，-1 表示不限量
     */
    private Integer stock;
}
