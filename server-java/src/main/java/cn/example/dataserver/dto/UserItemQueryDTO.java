package cn.example.dataserver.dto;

import lombok.Data;

/**
 * 我的道具查询参数
 */
@Data
public class UserItemQueryDTO {
    /**
     * 页码，从1开始
     */
    private Long page = 1L;

    /**
     * 每页条数
     */
    private Long size = 10L;

    /**
     * 状态筛选（usable/used）
     */
    private String status;

    /**
     * 搜索关键字（名称/描述/核销码）
     */
    private String keyword;
}
