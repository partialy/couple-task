package cn.example.dataserver.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import java.util.Date;
import lombok.Data;

/**
 * 道具流水表
 * @TableName item_transactions
 */
@TableName(value ="item_transactions")
@Data
public class ItemTransactions implements Serializable {
    /**
     * ID，自增
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;

    /**
     * 用户ID
     */
    @TableField(value = "user_id")
    private String userId;

    /**
     * 商品ID
     */
    @TableField(value = "item_id")
    private String itemId;

    /**
     * 变动数量（正数为获得，负数为消耗）
     */
    @TableField(value = "quantity")
    private Integer quantity;

    /**
     * 交易类型
     */
    @TableField(value = "transaction_type")
    private String transactionType;

    /**
     * 关联的业务ID
     */
    @TableField(value = "reference_id")
    private String referenceId;

    /**
     * 流水描述
     */
    @TableField(value = "description")
    private String description;

    /**
     * 发生时间
     */
    @TableField(value = "created_at")
    private Date createdAt;

    @TableField(exist = false)
    private static final long serialVersionUID = 1L;
}