package cn.example.dataserver.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import java.util.Date;
import lombok.Data;

/**
 * 用户设备表
 * @TableName user_devices
 */
@TableName(value ="user_devices")
@Data
public class UserDevices implements Serializable {
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
     * 设备类型 (苹果, 安卓, 网页)
     */
    @TableField(value = "device_type")
    private String deviceType;

    /**
     * 推送Token
     */
    @TableField(value = "device_token")
    private String deviceToken;

    /**
     * 设备名称
     */
    @TableField(value = "device_name")
    private String deviceName;

    /**
     * 最后活跃时间
     */
    @TableField(value = "last_active_at")
    private Date lastActiveAt;

    /**
     * 绑定时间
     */
    @TableField(value = "created_at")
    private Date createdAt;

    @TableField(exist = false)
    private static final long serialVersionUID = 1L;
}