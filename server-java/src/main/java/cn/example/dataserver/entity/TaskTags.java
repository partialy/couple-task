package cn.example.dataserver.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import lombok.Data;

/**
 * 任务-标签关联表
 * @TableName task_tags
 */
@TableName(value ="task_tags")
@Data
public class TaskTags implements Serializable {
    /**
     * 
     */
    @TableId(value = "task_id")
    private String taskId;

    /**
     * 
     */
    @TableId(value = "tag_id")
    private String tagId;

    @TableField(exist = false)
    private static final long serialVersionUID = 1L;
}