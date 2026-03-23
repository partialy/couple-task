package cn.example.dataserver.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

/**
 * 会话列表中最后一条消息摘要
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LastMessagePreviewVO {

    private String content;
    private String type;
    private Date createdAt;
}
