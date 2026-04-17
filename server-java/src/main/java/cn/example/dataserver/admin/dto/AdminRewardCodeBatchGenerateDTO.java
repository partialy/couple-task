package cn.example.dataserver.admin.dto;

import lombok.Data;

@Data
public class AdminRewardCodeBatchGenerateDTO {
    private Integer count;
    private String rewardType;
    private String rewardName;
    private Integer rewardCount;
    private String description;
}
