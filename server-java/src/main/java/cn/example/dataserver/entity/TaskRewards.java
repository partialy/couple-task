package cn.example.dataserver.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import lombok.Data;

/**
 * 任务奖励表
 * @TableName task_rewards
 */
@TableName(value ="task_rewards")
@Data
public class TaskRewards implements Serializable {
    /**
     * ID，全局唯一
     */
    @TableId(value = "id")
    private String id;

    /**
     * 关联任务ID
     */
    @TableField(value = "task_id")
    private String taskId;

    /**
     * 奖励类型 (normal, wildcard, points)
     */
    @TableField(value = "type")
    private String type;

    /**
     * 奖励内容文本
     */
    @TableField(value = "content")
    private String content;

    /**
     * 奖励图标标识符
     */
    @TableField(value = "icon")
    private String icon;

    /**
     * 奖励颜色标识符
     */
    @TableField(value = "color")
    private String color;

    /**
     * 数量（积分或万能卡）
     */
    @TableField(value = "amount")
    private Integer amount;

    /**
     * 排序权重
     */
    @TableField(value = "sort_order")
    private Integer sortOrder;

    /**
     * 奖励描述
     */
    @TableField(value = "description")
    private String description;

    @TableField(exist = false)
    private static final long serialVersionUID = 1L;
}