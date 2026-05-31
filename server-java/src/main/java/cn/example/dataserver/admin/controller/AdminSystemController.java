package cn.example.dataserver.admin.controller;

import cn.example.dataserver.admin.common.AdminResponseFactory;
import cn.example.dataserver.admin.dto.AdminPageQueryDTO;
import cn.example.dataserver.admin.services.AdminAuditService;
import cn.example.dataserver.admin.services.AdminGovernanceService;
import cn.example.dataserver.entity.SystemConfig;
import cn.example.dataserver.entity.SystemNotices;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/v1")
@RequiredArgsConstructor
public class AdminSystemController {

    private final AdminGovernanceService adminGovernanceService;
    private final AdminAuditService adminAuditService;

    @GetMapping("/system-notices")
    public String pageSystemNotices(AdminPageQueryDTO queryDTO, HttpServletRequest request) {
        return AdminResponseFactory.success(request, adminGovernanceService.pageSystemNotices(queryDTO));
    }

    @PostMapping("/system-notices/send")
    public String sendSystemNotice(@RequestBody SystemNotices payload, HttpServletRequest request) {
        adminGovernanceService.sendSystemNotice(payload);
        adminAuditService.logSuccess("system", "send_notice", "system_notice", payload.getReceiverUserId(), payload.toString());
        return AdminResponseFactory.success(request);
    }

    @GetMapping("/system-configs")
    public String pageSystemConfigs(AdminPageQueryDTO queryDTO, HttpServletRequest request) {
        return AdminResponseFactory.success(request, adminGovernanceService.pageSystemConfigs(queryDTO));
    }

    @PostMapping("/system-configs")
    public String createSystemConfig(@RequestBody SystemConfig payload, HttpServletRequest request) {
        return AdminResponseFactory.success(request, adminGovernanceService.createSystemConfig(payload));
    }

    @PutMapping("/system-configs/{id}")
    public String updateSystemConfig(@PathVariable Long id, @RequestBody SystemConfig payload, HttpServletRequest request) {
        return AdminResponseFactory.success(request, adminGovernanceService.updateSystemConfig(id, payload));
    }

    @PostMapping("/system-configs/{id}/enable")
    public String enableSystemConfig(@PathVariable Long id, HttpServletRequest request) {
        adminGovernanceService.updateSystemConfigEnabled(id, 1);
        adminAuditService.logSuccess("system", "enable_config", "system_config", String.valueOf(id), "{}");
        return AdminResponseFactory.success(request);
    }

    @PostMapping("/system-configs/{id}/disable")
    public String disableSystemConfig(@PathVariable Long id, HttpServletRequest request) {
        adminGovernanceService.updateSystemConfigEnabled(id, 0);
        adminAuditService.logSuccess("system", "disable_config", "system_config", String.valueOf(id), "{}");
        return AdminResponseFactory.success(request);
    }
}
