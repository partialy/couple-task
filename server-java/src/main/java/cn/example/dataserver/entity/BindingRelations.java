package cn.example.dataserver.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import java.util.Date;
import lombok.Data;

/**
 * 绑定关系表
 * @TableName binding_relations
 */
@TableName(value ="binding_relations")
@Data
public class BindingRelations implements Serializable {
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
     * 目标ID
     */
    @TableField(value = "target_id")
    private String targetId;

    /**
     * 状态：申请中、已接受、已拒绝、已解除
     */
    @TableField(value = "status")
    private String status;

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

    @TableField(exist = false)
    private static final long serialVersionUID = 1L;
}