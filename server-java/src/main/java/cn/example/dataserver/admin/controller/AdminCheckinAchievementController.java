package cn.example.dataserver.admin.controller;

import cn.example.dataserver.admin.common.AdminResponseFactory;
import cn.example.dataserver.admin.dto.AdminPageQueryDTO;
import cn.example.dataserver.admin.dto.AdminStatusUpdateDTO;
import cn.example.dataserver.admin.services.AdminAuditService;
import cn.example.dataserver.admin.services.AdminGovernanceService;
import cn.example.dataserver.entity.Achievements;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/v1")
@RequiredArgsConstructor
public class AdminCheckinAchievementController {

    private final AdminGovernanceService adminGovernanceService;
    private final AdminAuditService adminAuditService;

    @GetMapping("/checkin-plans")
    public String pageCheckinPlans(AdminPageQueryDTO queryDTO, HttpServletRequest request) {
        return AdminResponseFactory.success(request, adminGovernanceService.pageCheckinPlans(queryDTO));
    }

    @PostMapping("/checkin-plans/{id}/status")
    public String updateCheckinStatus(@PathVariable String id, @RequestBody AdminStatusUpdateDTO dto, HttpServletRequest request) {
        adminGovernanceService.updateCheckinPlanStatus(id, dto.getStatus());
        adminAuditService.logSuccess("checkin", "update_status", "checkin_plan", id, dto.toString());
        return AdminResponseFactory.success(request);
    }

    @GetMapping("/checkin-records")
    public String pageCheckinRecords(AdminPageQueryDTO queryDTO, HttpServletRequest request) {
        return AdminResponseFactory.success(request, adminGovernanceService.pageCheckinRecords(queryDTO));
    }

    @GetMapping("/achievements")
    public String pageAchievements(AdminPageQueryDTO queryDTO, HttpServletRequest request) {
        return AdminResponseFactory.success(request, adminGovernanceService.pageAchievements(queryDTO));
    }

    @PostMapping("/achievements")
    public String createAchievement(@RequestBody Achievements payload, HttpServletRequest request) {
        return AdminResponseFactory.success(request, adminGovernanceService.createAchievement(payload));
    }

    @PutMapping("/achievements/{id}")
    public String updateAchievement(@PathVariable String id, @RequestBody Achievements payload, HttpServletRequest request) {
        return AdminResponseFactory.success(request, adminGovernanceService.updateAchievement(id, payload));
    }

    @PostMapping("/achievements/{id}/status")
    public String updateAchievementStatus(@PathVariable String id, @RequestBody AdminStatusUpdateDTO dto, HttpServletRequest request) {
        adminGovernanceService.updateAchievementStatus(id, dto.getStatus());
        adminAuditService.logSuccess("achievement", "update_status", "achievement", id, dto.toString());
        return AdminResponseFactory.success(request);
    }
}
