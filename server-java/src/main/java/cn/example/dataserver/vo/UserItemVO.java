package cn.example.dataserver.vo;

import lombok.Data;

import java.util.Date;

/**
 * 我的道具分页项
 */
@Data
public class UserItemVO {
    /**
     * 用户道具ID
     */
    private String id;

    /**
     * 商品ID
     */
    private String itemId;

    /**
     * 道具名称
     */
    private String name;

    /**
     * 道具描述
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
     * 道具类型
     */
    private String type;

    /**
     * 状态（usable/used）
     */
    private String status;

    /**
     * 核销码
     */
    private String code;

    /**
     * 获得时间
     */
    private Date acquiredAt;

    /**
     * 使用时间
     */
    private Date usedAt;

    /**
     * 是否来自特别奖励兑换（0 否，1 是）
     */
    private Integer isSpecial;
}
