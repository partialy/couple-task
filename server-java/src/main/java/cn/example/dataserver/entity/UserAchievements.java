package cn.example.dataserver.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import java.util.Date;
import lombok.Data;

/**
 * 用户成就解锁表
 * @TableName user_achievements
 */
@TableName(value ="user_achievements")
@Data
public class UserAchievements implements Serializable {
    /**
     * ID，全局唯一
     */
    @TableId(value = "id")
    private String id;

    /**
     * 用户ID
     */
    @TableField(value = "user_id")
    private String userId;

    /**
     * 成就ID
     */
    @TableField(value = "achievement_id")
    private String achievementId;

    /**
     * 留念图片
     */
    @TableField(value = "image_url")
    private String imageUrl;

    /**
     * 心得笔记
     */
    @TableField(value = "note")
    private String note;

    /**
     * 解锁时间
     */
    @TableField(value = "completed_at")
    private Date completedAt;

    @TableField(exist = false)
    private static final long serialVersionUID = 1L;
}