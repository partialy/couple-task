package cn.example.dataserver.admin.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.util.Date;

/**
 * 管理员用户表 admin_users
 */
@Data
@TableName("admin_users")
public class AdminUsers implements Serializable {

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    @TableField("username")
    private String username;

    @TableField("name")
    private String name;

    @TableField("password")
    private String password;

    @TableField("status")
    private String status;

    @TableField("created_at")
    private Date createdAt;

    @TableField("updated_at")
    private Date updatedAt;

    @TableField("deleted_at")
    private Date deletedAt;

    @TableField("is_super")
    private Integer isSuper;

    @TableField(exist = false)
    private static final long serialVersionUID = 1L;
}
