package cn.example.dataserver.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import java.util.Date;
import lombok.Data;

/**
 * 系统配置表
 * @TableName system_config
 */
@TableName(value ="system_config")
@Data
public class SystemConfig implements Serializable {
    /**
     * 主键ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 配置项的唯一标识符，例如：应用名称、功能开关、邮件服务器等
     */
    @TableField(value = "config_key")
    private String configKey;

    /**
     * 配置项的值。对于复杂类型（如JSON），可存储在此字段。
     */
    @TableField(value = "config_value")
    private String configValue;

    /**
     * 配置值的数据类型，用于程序解析和校验。
     */
    @TableField(value = "data_type")
    private Object dataType;

    /**
     * 配置项的分类，便于管理和查询，例如：应用信息、功能标志、邮件设置、缓存配置等
     */
    @TableField(value = "category")
    private String category;

    /**
     * 配置项的详细描述，说明其用途和可能的取值。
     */
    @TableField(value = "description")
    private String description;

    /**
     * 是否启用该配置项。0-禁用，1-启用。可用于临时关闭某个功能而无需删除记录。
     */
    @TableField(value = "is_enabled")
    private Integer isEnabled;

    /**
     * 记录创建时间
     */
    @TableField(value = "created_at")
    private Date createdAt;

    /**
     * 记录最后更新时间
     */
    @TableField(value = "updated_at")
    private Date updatedAt;

    @TableField(exist = false)
    private static final long serialVersionUID = 1L;
}