package cn.example.dataserver.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import java.util.Date;
import lombok.Data;

/**
 * 任务模板库表
 * @TableName task_templates
 */
@TableName(value ="task_templates")
@Data
public class TaskTemplates implements Serializable {
    /**
     * ID，全局唯一
     */
    @TableId(value = "id")
    private String id;

    /**
     * 模板标题
     */
    @TableField(value = "title")
    private String title;

    /**
     * 模板描述
     */
    @TableField(value = "description")
    private String description;

    /**
     * 推荐分类ID
     */
    @TableField(value = "category_id")
    private String categoryId;

    /**
     * 推荐等级ID
     */
    @TableField(value = "level_id")
    private String levelId;

    /**
     * 封面图URL
     */
    @TableField(value = "cover_image")
    private String coverImage;

    /**
     * 推荐奖励类型 (normal, wildcard, points)
     */
    @TableField(value = "reward_type")
    private String rewardType;

    /**
     * 推荐奖励数量
     */
    @TableField(value = "reward_amount")
    private Integer rewardAmount;

    /**
     * 来源 (system, user)
     */
    @TableField(value = "source")
    private String source;

    /**
     * 投稿用户ID（系统模板为空）
     */
    @TableField(value = "author_id")
    private String authorId;

    /**
     * 状态 (pending, approved, rejected)
     */
    @TableField(value = "status")
    private String status;

    /**
     * 被使用/拉取次数
     */
    @TableField(value = "usage_count")
    private Integer usageCount;

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

    @TableField(exist = false)
    private static final long serialVersionUID = 1L;
}