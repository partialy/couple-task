package cn.example.dataserver.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.util.Date;

/**
 * 日记表
 */
@TableName(value = "diary_entries")
@Data
public class DiaryEntries implements Serializable {

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
     * 日记所属日期
     */
    @TableField(value = "entry_date")
    private Date entryDate;

    /**
     * 心情标识
     */
    @TableField(value = "mood")
    private String mood;

    /**
     * 日记正文
     */
    @TableField(value = "content")
    private String content;

    /**
     * 配图地址
     */
    @TableField(value = "image_url")
    private String imageUrl;

    /**
     * 对方是否点赞：1是0否
     */
    @TableField(value = "liked_by_partner")
    private Integer likedByPartner;

    /**
     * 作者信息JSON
     */
    @TableField(value = "author_json")
    private String authorJson;

    /**
     * 评论数组JSON
     */
    @TableField(value = "comments_json")
    private String commentsJson;

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
