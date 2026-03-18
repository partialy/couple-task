package cn.example.dataserver.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import lombok.Data;

/**
 * 任务等级表
 * @TableName task_levels
 */
@TableName(value ="task_levels")
@Data
public class TaskLevels implements Serializable {
    /**
     * ID，全局唯一
     */
    @TableId(value = "id")
    private String id;

    /**
     * 等级名称
     */
    @TableField(value = "name")
    private String name;

    /**
     * 最大奖励数量
     */
    @TableField(value = "max_rewards")
    private Integer maxRewards;

    /**
     * 排序权重
     */
    @TableField(value = "sort_order")
    private Integer sortOrder;

    /**
     * 关联绑定关系的id
     */
    @TableField(value = "belong_binding_id")
    private String belongBindingId;

    @TableField(exist = false)
    private static final long serialVersionUID = 1L;
}