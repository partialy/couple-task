package cn.example.dataserver.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import lombok.Data;

/**
 * 任务图片表
 * @TableName task_images
 */
@TableName(value ="task_images")
@Data
public class TaskImages implements Serializable {
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
     * 图片URL
     */
    @TableField(value = "image_url")
    private String imageUrl;

    /**
     * 排序权重
     */
    @TableField(value = "sort_order")
    private Integer sortOrder;

    @TableField(exist = false)
    private static final long serialVersionUID = 1L;
}