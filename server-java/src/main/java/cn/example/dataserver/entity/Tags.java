package cn.example.dataserver.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import lombok.Data;

/**
 * 标签表
 * @TableName tags
 */
@TableName(value ="tags")
@Data
public class Tags implements Serializable {
    /**
     * ID，全局唯一
     */
    @TableId(value = "id")
    private String id;

    /**
     * 标签名称
     */
    @TableField(value = "name")
    private String name;

    /**
     * 所属绑定ID
     */
    @TableField(value = "belong_binding_id")
    private String belongBindingId;

    @TableField(exist = false)
    private static final long serialVersionUID = 1L;
}