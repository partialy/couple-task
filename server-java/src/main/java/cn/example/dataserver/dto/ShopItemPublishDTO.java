package cn.example.dataserver.dto;

import lombok.Data;

/**
 * 商城商品发布/更新
 */
@Data
public class ShopItemPublishDTO {
    private String name;
    private String description;
    /** 道具类型 prop / wildcard / other */
    private String itemType;
    private Integer pointsCost;
    /** Lucide 图标 key 或图片 URL（与发布表单一致：有图则传 URL） */
    private String icon;
    /** 颜色 key，如 pink */
    private String color;
    /** -1 不限 */
    private Integer stock;
    /** active / inactive */
    private String status;
}
