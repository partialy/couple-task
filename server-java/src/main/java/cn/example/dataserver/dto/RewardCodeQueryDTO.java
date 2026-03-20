package cn.example.dataserver.dto;

import lombok.Data;

/**
 * 我的兑换码分页查询参数
 */
@Data
public class RewardCodeQueryDTO {
    /**
     * 页码，从 1 开始
     */
    private Long page = 1L;

    /**
     * 每页条数
     */
    private Long size = 10L;

    /**
     * 奖励类型筛选（prop、points、wild_card）
     */
    private String rewardType;

    /**
     * 状态筛选（unused、used、voided）
     */
    private String status;
}
