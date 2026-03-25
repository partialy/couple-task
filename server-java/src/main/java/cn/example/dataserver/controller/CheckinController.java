package cn.example.dataserver.controller;

import cn.example.dataserver.dto.CheckinPlanDTO;
import cn.example.dataserver.dto.CheckinPlanStatusDTO;
import cn.example.dataserver.services.CheckinServiceImplements;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 签到模块
 */
@CrossOrigin
@RestController
@RequestMapping("/checkin")
@RequiredArgsConstructor
public class CheckinController {

    private final CheckinServiceImplements checkinServiceImplements;

    // ==================== 签到计划管理 ====================

    /**
     * 创建签到计划（含每日奖励）
     */
    @PostMapping("/plans")
    public String createPlan(@RequestHeader("Authorization") String token,
                             @RequestBody CheckinPlanDTO dto) {
        return checkinServiceImplements.createPlan(token, dto);
    }

    /**
     * 更新签到计划
     */
    @PutMapping("/plans/{id}")
    public String updatePlan(@RequestHeader("Authorization") String token,
                             @PathVariable String id,
                             @RequestBody CheckinPlanDTO dto) {
        return checkinServiceImplements.updatePlan(token, id, dto);
    }

    /**
     * 获取我相关的签到计划列表
     */
    @GetMapping("/plans")
    public String listPlans(@RequestHeader("Authorization") String token) {
        return checkinServiceImplements.listPlans(token);
    }

    /**
     * 获取我发布的签到计划（配置者视角）
     */
    @GetMapping("/plans/my-created")
    public String listMyCreatedPlans(@RequestHeader("Authorization") String token) {
        return checkinServiceImplements.listMyCreatedPlans(token);
    }

    /**
     * 获取我需要签到的计划（签到者视角）
     */
    @GetMapping("/plans/my-target")
    public String listMyTargetPlans(@RequestHeader("Authorization") String token) {
        return checkinServiceImplements.listMyTargetPlans(token);
    }

    /**
     * 获取计划详情（含每日奖励）
     */
    @GetMapping("/plans/{id}")
    public String getPlanDetail(@RequestHeader("Authorization") String token,
                                @PathVariable String id) {
        return checkinServiceImplements.getPlanDetail(token, id);
    }

    /**
     * 删除签到计划（软删除）
     */
    @DeleteMapping("/plans/{id}")
    public String deletePlan(@RequestHeader("Authorization") String token,
                             @PathVariable String id) {
        return checkinServiceImplements.deletePlan(token, id);
    }

    /**
     * 启用/停用签到计划
     */
    @PutMapping("/plans/{id}/status")
    public String updatePlanStatus(@RequestHeader("Authorization") String token,
                                   @PathVariable String id,
                                   @RequestBody CheckinPlanStatusDTO dto) {
        return checkinServiceImplements.updatePlanStatus(token, id, dto);
    }

    // ==================== 签到操作 ====================

    /**
     * 执行签到
     */
    @PostMapping("/{planId}")
    public String performCheckin(@RequestHeader("Authorization") String token,
                                 @PathVariable String planId) {
        return checkinServiceImplements.performCheckin(token, planId);
    }

    /**
     * 获取签到状态
     */
    @GetMapping("/{planId}/status")
    public String getCheckinStatus(@RequestHeader("Authorization") String token,
                                   @PathVariable String planId) {
        return checkinServiceImplements.getCheckinStatus(token, planId);
    }

    /**
     * 获取签到日历数据
     */
    @GetMapping("/{planId}/calendar")
    public String getCheckinCalendar(@RequestHeader("Authorization") String token,
                                     @PathVariable String planId,
                                     @RequestParam(required = false) Integer year,
                                     @RequestParam(required = false) Integer month) {
        return checkinServiceImplements.getCheckinCalendar(token, planId, year, month);
    }
}
