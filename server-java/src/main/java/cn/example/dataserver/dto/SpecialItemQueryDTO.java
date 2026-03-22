package cn.example.dataserver.dto;

import lombok.Data;

/**
 * 特别奖励分页查询参数
 */
@Data
public class SpecialItemQueryDTO {

    /**
     * 页码，从 1 开始
     */
    private Long page;

    /**
     * 每页条数
     */
    private Long size;

    /**
     * 状态筛选：active、inactive，空表示全部
     */
    private String status;

    /**
     * 区分自己和对方
     */
    private String type;
}
