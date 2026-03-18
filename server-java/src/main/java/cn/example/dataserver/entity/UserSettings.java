package cn.example.dataserver.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import java.util.Date;
import lombok.Data;

/**
 * 用户设置表
 * @TableName user_settings
 */
@TableName(value ="user_settings")
@Data
public class UserSettings implements Serializable {
    /**
     * 用户ID
     */
    @TableId(value = "user_id")
    private String userId;

    /**
     * 主题 (浅色, 深色, 系统)
     */
    @TableField(value = "theme")
    private String theme;

    /**
     * 是否开启通知
     */
    @TableField(value = "notifications_enabled")
    private Integer notificationsEnabled;

    /**
     * 是否开启声音
     */
    @TableField(value = "sound_enabled")
    private Integer soundEnabled;

    /**
     * 是否开启震动
     */
    @TableField(value = "vibration_enabled")
    private Integer vibrationEnabled;

    /**
     * 是否开启隐私模式
     */
    @TableField(value = "privacy_mode")
    private Integer privacyMode;

    /**
     * 更新时间
     */
    @TableField(value = "updated_at")
    private Date updatedAt;

    @TableField(exist = false)
    private static final long serialVersionUID = 1L;
}