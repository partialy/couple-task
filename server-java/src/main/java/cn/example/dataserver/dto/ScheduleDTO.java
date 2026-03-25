package cn.example.dataserver.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

/**
 * 日程创建/更新 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleDTO {
    /**
     * 日程类型名称，最大20汉字
     */
    private String type;

    /**
     * 描述
     */
    private String description;

    /**
     * 位置
     */
    private String location;

    /**
     * 图片URL列表，最多3个
     */
    private List<String> images;

    /**
     * 事件日期时间，格式 yyyy-MM-dd HH:mm:ss
     */
    private String eventTime;

    /**
     * 关联业务ID
     */
    private String eventRelationId;

    /**
     * 当天是否弹窗提示
     */
    private Boolean popupRemind;
}
