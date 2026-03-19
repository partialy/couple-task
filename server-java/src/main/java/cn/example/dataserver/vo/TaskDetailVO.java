package cn.example.dataserver.vo;

import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 任务详情VO
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class TaskDetailVO extends TaskVO {
    /**
     * 发布人信息
     */
    private PublisherVO publisher;

    /**
     * 评论数量
     */
    private Long commentCount;
}
