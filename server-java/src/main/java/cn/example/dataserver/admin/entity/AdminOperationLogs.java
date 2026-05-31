package cn.example.dataserver.admin.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.util.Date;

@Data
@TableName("admin_operation_logs")
public class AdminOperationLogs implements Serializable {
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    @TableField("admin_user_id")
    private String adminUserId;

    @TableField("module")
    private String module;

    @TableField("action")
    private String action;

    @TableField("target_type")
    private String targetType;

    @TableField("target_id")
    private String targetId;

    @TableField("request_json")
    private String requestJson;

    @TableField("response_json")
    private String responseJson;

    @TableField("result")
    private String result;

    @TableField("created_at")
    private Date createdAt;
}
