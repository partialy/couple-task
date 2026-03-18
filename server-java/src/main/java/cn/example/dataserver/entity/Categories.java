package cn.example.dataserver.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import lombok.Data;

/**
 * 任务分类表
 * @TableName categories
 */
@TableName(value ="categories")
@Data
public class Categories implements Serializable {
    /**
     * ID，全局唯一
     */
    @TableId(value = "id")
    private String id;

    /**
     * 分类名称
     */
    @TableField(value = "name")
    private String name;

    /**
     * 排序权重
     */
    @TableField(value = "sort_order")
    private Integer sortOrder;

    /**
     * 所属绑定ID
     */
    @TableField(value = "belong_binding_id")
    private String belongBindingId;

    @TableField(exist = false)
    private static final long serialVersionUID = 1L;
}