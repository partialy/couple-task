package cn.example.dataserver.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import java.util.Date;

import lombok.Builder;
import lombok.Data;

/**
 * 用户表
 * @TableName users
 */
@TableName(value ="users")
@Data
@Builder
public class Users implements Serializable {
    /**
     * ID，全局唯一
     */
    @TableId(value = "id")
    private String id;

    /**
     * 用户名
     */
    @TableField(value = "username")
    private String username;

    /**
     * 昵称
     */
    @TableField(value = "nickname")
    private String nickname;

    /**
     * 性别 (男, 女, 其他)
     */
    @TableField(value = "gender")
    private String gender;

    /**
     * 头像URL
     */
    @TableField(value = "avatar")
    private String avatar;

    /**
     * 用户等级
     */
    @TableField(value = "level")
    private Integer level;

    /**
     * 称号
     */
    @TableField(value = "title")
    private String title;

    /**
     * 生日
     */
    @TableField(value = "birthday")
    private Date birthday;

    /**
     * 纪念日
     */
    @TableField(value = "anniversary")
    private Date anniversary;

    /**
     * 位置
     */
    @TableField(value = "location")
    private String location;

    /**
     * 手机号
     */
    @TableField(value = "phone")
    private String phone;

    /**
     * 邮箱
     */
    @TableField(value = "email")
    private String email;

    /**
     * 密码
     */
    @TableField(value = "password")
    private String password;

    /**
     * 登录方式 (邮箱, 手机, 用户名)
     */
    @TableField(value = "login_method")
    private String loginMethod;

    /**
     * 最后登录时间
     */
    @TableField(value = "last_login_at")
    private Date lastLoginAt;

    /**
     * 最后登录IP
     */
    @TableField(value = "last_login_ip")
    private String lastLoginIp;

    /**
     * 积分余额
     */
    @TableField(value = "points")
    private Integer points;

    /**
     * 万能卡余额
     */
    @TableField(value = "cards")
    private Integer cards;

    /**
     * 乐观锁版本号（用于并发扣除积分/卡片防超卖）
     */
    @TableField(value = "version")
    private Integer version;

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
     * 用户账号状态
     */
    @TableField(value = "status")
    private String status;

    /**
     * 用户账号封禁结束时间
     */
    @TableField(value = "block_end_at")
    private Date blockEndAt;

    /**
     * 邀请码
     */
    @TableField(value = "invite_code")
    private String inviteCode;

    @TableField(exist = false)
    private static final long serialVersionUID = 1L;
}