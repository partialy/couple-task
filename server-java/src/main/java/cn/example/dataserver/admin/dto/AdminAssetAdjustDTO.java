package cn.example.dataserver.admin.dto;

import lombok.Data;

@Data
public class AdminAssetAdjustDTO {
    private Integer pointsDelta;
    private Integer cardsDelta;
    private String reason;
}
