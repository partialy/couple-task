package cn.example.dataserver.admin.dto;

import lombok.Data;

@Data
public class AdminPageQueryDTO {
    private Long page = 1L;
    private Long pageSize = 20L;
    private String keyword;
    private String status;
    private String startTime;
    private String endTime;
}
