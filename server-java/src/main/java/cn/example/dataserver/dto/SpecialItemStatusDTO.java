package cn.example.dataserver.dto;

import lombok.Data;

/**
 * 更新特别奖励上下架状态
 */
@Data
public class SpecialItemStatusDTO {

    /**
     * 状态：active、inactive
     */
    private String status;
}
