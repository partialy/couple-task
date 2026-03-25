package cn.example.dataserver.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * 签到计划启用/停用 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CheckinPlanStatusDTO {
    /**
     * 状态：active | inactive
     */
    private String status;
}
