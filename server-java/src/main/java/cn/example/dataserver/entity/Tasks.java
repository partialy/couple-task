package cn.example.dataserver.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import java.util.Date;
import lombok.Data;

/**
 * 任务表
 * @TableName tasks
 */
@TableName(value ="tasks")
@Data
public class Tasks implements Serializable {
    /**
     * ID，全局唯一
     */
    @TableId(value = "id")
    private String id;

    /**
     * 发布者ID
     */
    @TableField(value = "author_id")
    private String authorId;

    /**
     * 接收者ID
     */
    @TableField(value = "receiver_id")
    private String receiverId;

    /**
     * 分类ID
     */
    @TableField(value = "category_id")
    private String categoryId;

    /**
     * 等级ID
     */
    @TableField(value = "level_id")
    private String levelId;

    /**
     * 任务标题
     */
    @TableField(value = "title")
    private String title;

    /**
     * 任务详细描述
     */
    @TableField(value = "description")
    private String description;

    /**
     * 封面图URL
     */
    @TableField(value = "cover_image")
    private String coverImage;

    /**
     * 截止日期
     */
    @TableField(value = "deadline")
    private Date deadline;

    /**
     * 任务地点
     */
    @TableField(value = "location")
    private String location;

    /**
     * 任务状态 (pending, accepted, completed, cancelled)
     */
    @TableField(value = "status")
    private String status;

    /**
     * 是否为私密任务
     */
    @TableField(value = "is_private")
    private Integer isPrivate;

    /**
     * 是否使用了特权卡加急
     */
    @TableField(value = "is_privileged")
    private Integer isPrivileged;

    /**
     * 重复类型 (none, daily, weekly, monthly)
     */
    @TableField(value = "repeat_type")
    private String repeatType;

    /**
     * 重复规则配置（如周一、周三）
     */
    @TableField(value = "repeat_config")
    private Object repeatConfig;

    /**
     * 创建时间
     */
    @TableField(value = "created_at")
    private Date createdAt;

    /**
     * 更新时间
     */
    @TableField(value = "updated_at")
    private Date updatedAt;

    /**
     * 逻辑删除时间
     */
    @TableField(value = "deleted_at")
    private Date deletedAt;

    /**
     * 所属绑定ID
     */
    @TableField(value = "belong_binding_id")
    private String belongBindingId;

    /**
     * 标签
     */
    @TableField(value = "tags")
    private Object tags;

    @TableField(exist = false)
    private static final long serialVersionUID = 1L;
}