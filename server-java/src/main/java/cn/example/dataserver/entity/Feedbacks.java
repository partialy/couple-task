package cn.example.dataserver.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import java.util.Date;
import lombok.Data;

/**
 * 用户反馈表
 * @TableName feedbacks
 */
@TableName(value ="feedbacks")
@Data
public class Feedbacks implements Serializable {
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
     * 反馈内容
     */
    @TableField(value = "content")
    private String content;

    /**
     * 反馈图片URL数组
     */
    @TableField(value = "images")
    private Object images;

    /**
     * 联系方式
     */
    @TableField(value = "contact_info")
    private String contactInfo;

    /**
     * 状态 (pending, processing, resolved, closed)
     */
    @TableField(value = "status")
    private String status;

    /**
     * 客服回复
     */
    @TableField(value = "reply")
    private String reply;

    /**
     * 提交时间
     */
    @TableField(value = "created_at")
    private Date createdAt;

    /**
     * 更新时间
     */
    @TableField(value = "updated_at")
    private Date updatedAt;

    @TableField(exist = false)
    private static final long serialVersionUID = 1L;
}