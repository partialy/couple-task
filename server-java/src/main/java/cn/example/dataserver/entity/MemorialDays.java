package cn.example.dataserver.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import java.util.Date;
import lombok.Data;

/**
 * 纪念日与倒数日表
 */
@TableName(value = "memorial_days")
@Data
public class MemorialDays implements Serializable {

    /**
     * 主键，UUID
     */
    @TableId(value = "id")
    private String id;

    /**
     * 所属绑定关系ID
     */
    @TableField(value = "bind_id")
    private String bindId;

    /**
     * 创建者用户ID
     */
    @TableField(value = "user_id")
    private String userId;

    /**
     * 展示标题
     */
    @TableField(value = "title")
    private String title;

    /**
     * 事件类型：anniversary 或 birthday
     */
    @TableField(value = "event_type")
    private String eventType;

    /**
     * 预设图标 key
     */
    @TableField(value = "icon_key")
    private String iconKey;

    /**
     * 自定义图标 URL
     */
    @TableField(value = "custom_icon_url")
    private String customIconUrl;

    /**
     * 主题色标识
     */
    @TableField(value = "color_theme_id")
    private String colorThemeId;

    /**
     * 用户自定义分类
     */
    @TableField(value = "custom_category")
    private String customCategory;

    /**
     * 生日时的姓名
     */
    @TableField(value = "person_name")
    private String personName;

    /**
     * 是否置顶：1 或 0
     */
    @TableField(value = "is_pinned")
    private Integer isPinned;

    /**
     * 兼容字段：1=倒数日 2=纪念日
     */
    @TableField(value = "kind")
    private Integer kind;

    /**
     * 锚点日期
     */
    @TableField(value = "anchor_date")
    private Date anchorDate;

    /**
     * 是否每年重复
     */
    @TableField(value = "repeat_yearly")
    private Integer repeatYearly;

    /**
     * 备注
     */
    @TableField(value = "note")
    private String note;

    /**
     * 排序权重
     */
    @TableField(value = "sort_order")
    private Integer sortOrder;

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
     * 软删除时间
     */
    @TableField(value = "deleted_at")
    private Date deletedAt;

    @TableField(exist = false)
    private static final long serialVersionUID = 1L;
}
