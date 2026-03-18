package cn.example.dataserver.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import lombok.Data;

/**
 * 成就表
 * @TableName achievements
 */
@TableName(value ="achievements")
@Data
public class Achievements implements Serializable {
    /**
     * ID，全局唯一
     */
    @TableId(value = "id")
    private String id;

    /**
     * 所属分类ID
     */
    @TableField(value = "category_id")
    private String categoryId;

    /**
     * 成就标题
     */
    @TableField(value = "title")
    private String title;

    /**
     * 成就描述
     */
    @TableField(value = "description")
    private String description;

    /**
     * 图标
     */
    @TableField(value = "icon")
    private String icon;

    /**
     * 完成奖励积分
     */
    @TableField(value = "points_reward")
    private Integer pointsReward;

    /**
     * 排序权重
     */
    @TableField(value = "sort_order")
    private Integer sortOrder;

    @TableField(exist = false)
    private static final long serialVersionUID = 1L;
}