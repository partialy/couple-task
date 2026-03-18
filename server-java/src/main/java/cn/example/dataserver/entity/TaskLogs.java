package cn.example.dataserver.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import java.util.Date;
import lombok.Data;

/**
 * 任务状态变更日志表
 * @TableName task_logs
 */
@TableName(value ="task_logs")
@Data
public class TaskLogs implements Serializable {
    /**
     * ID，自增
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;

    /**
     * 任务ID
     */
    @TableField(value = "task_id")
    private String taskId;

    /**
     * 触发操作的用户ID
     */
    @TableField(value = "user_id")
    private String userId;

    /**
     * 操作类型
     */
    @TableField(value = "action")
    private String action;

    /**
     * 变更前的状态
     */
    @TableField(value = "previous_status")
    private String previousStatus;

    /**
     * 变更后的状态
     */
    @TableField(value = "new_status")
    private String newStatus;

    /**
     * 备注说明
     */
    @TableField(value = "remark")
    private String remark;

    /**
     * 发生时间
     */
    @TableField(value = "created_at")
    private Date createdAt;

    @TableField(exist = false)
    private static final long serialVersionUID = 1L;
}