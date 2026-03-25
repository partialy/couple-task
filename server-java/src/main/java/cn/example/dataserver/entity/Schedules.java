package cn.example.dataserver.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import java.util.Date;
import lombok.Data;

/**
 * 日程/行程表
 * @TableName schedules
 */
@TableName(value = "schedules")
@Data
public class Schedules implements Serializable {
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
     * 日程类型名称，最大20汉字
     */
    @TableField(value = "type")
    private String type;

    /**
     * 描述
     */
    @TableField(value = "description")
    private String description;

    /**
     * 位置
     */
    @TableField(value = "location")
    private String location;

    /**
     * 图片列表，JSON数组格式
     */
    @TableField(value = "images")
    private String images;

    /**
     * 具体事件日期时间
     */
    @TableField(value = "event_time")
    private Date eventTime;

    /**
     * 关联业务ID，例如关联某个任务
     */
    @TableField(value = "event_relation_id")
    private String eventRelationId;

    /**
     * 当天是否弹窗提示（1=是，0=否）
     */
    @TableField(value = "popup_remind")
    private Integer popupRemind;

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
     * 软删除时间戳
     */
    @TableField(value = "deleted_at")
    private Date deletedAt;

    @TableField(exist = false)
    private static final long serialVersionUID = 1L;
}
