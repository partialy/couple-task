package cn.example.dataserver.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import java.util.Date;
import lombok.Data;

/**
 * 心愿条目
 */
@TableName(value = "wish_items")
@Data
public class WishItems implements Serializable {

    @TableId(value = "id")
    private String id;

    @TableField(value = "bind_id")
    private String bindId;

    @TableField(value = "publisher_user_id")
    private String publisherUserId;

    @TableField(value = "pickable_by_user_id")
    private String pickableByUserId;

    @TableField(value = "content")
    private String content;

    @TableField(value = "color_key")
    private String colorKey;

    @TableField(value = "bottle_side")
    private Integer bottleSide;

    @TableField(value = "picked_times")
    private Integer pickedTimes;

    @TableField(value = "status")
    private String status;

    @TableField(value = "last_picked_by_user_id")
    private String lastPickedByUserId;

    @TableField(value = "last_picked_at")
    private Date lastPickedAt;

    @TableField(value = "fulfilled_at")
    private Date fulfilledAt;

    @TableField(value = "created_at")
    private Date createdAt;

    @TableField(value = "updated_at")
    private Date updatedAt;

    @TableField(value = "deleted_at")
    private Date deletedAt;

    /** 仅在「我的心愿」记录列表中隐藏，对方仍可在瓶中摘取 */
    @TableField(value = "record_hidden_at")
    private Date recordHiddenAt;

    @TableField(exist = false)
    private static final long serialVersionUID = 1L;
}
