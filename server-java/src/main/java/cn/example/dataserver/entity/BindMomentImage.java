package cn.example.dataserver.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import lombok.Data;

@Data
@TableName(value = "bind_moment_images")
public class BindMomentImage implements Serializable {

    @TableId(value = "id")
    private String id;

    @TableField(value = "moment_id")
    private String momentId;

    @TableField(value = "url")
    private String url;

    @TableField(value = "sort_order")
    private Integer sortOrder;
}
