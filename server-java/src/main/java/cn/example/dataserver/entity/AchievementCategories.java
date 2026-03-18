package cn.example.dataserver.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import lombok.Data;

/**
 * 成就分类表
 * @TableName achievement_categories
 */
@TableName(value ="achievement_categories")
@Data
public class AchievementCategories implements Serializable {
    /**
     * ID，全局唯一
     */
    @TableId(value = "id")
    private String id;

    /**
     * 分类标题
     */
    @TableField(value = "title")
    private String title;

    /**
     * 分类描述
     */
    @TableField(value = "description")
    private String description;

    /**
     * 封面图
     */
    @TableField(value = "cover_image")
    private String coverImage;

    /**
     * 排序权重
     */
    @TableField(value = "sort_order")
    private Integer sortOrder;

    @TableField(exist = false)
    private static final long serialVersionUID = 1L;
}