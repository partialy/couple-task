package cn.example.dataserver.admin.controller;

import cn.example.dataserver.admin.common.AdminAuthContext;
import cn.example.dataserver.admin.common.AdminResponseFactory;
import cn.example.dataserver.admin.dto.AdminPageQueryDTO;
import cn.example.dataserver.admin.dto.AdminRewardCodeBatchGenerateDTO;
import cn.example.dataserver.admin.services.AdminAuditService;
import cn.example.dataserver.admin.services.AdminMvpService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/v1/reward-codes")
@RequiredArgsConstructor
public class AdminRewardCodeController {

    private final AdminMvpService adminMvpService;
    private final AdminAuditService adminAuditService;

    @GetMapping
    public String pageRewardCodes(AdminPageQueryDTO queryDTO, HttpServletRequest request) {
        return AdminResponseFactory.success(request, adminMvpService.pageRewardCodes(queryDTO));
    }

    @PostMapping("/batch-generate")
    public String batchGenerate(@RequestBody AdminRewardCodeBatchGenerateDTO dto, HttpServletRequest request) {
        adminMvpService.batchGenerateRewardCodes(dto, AdminAuthContext.getAdminId());
        adminAuditService.logSuccess("reward_codes", "batch_generate", "reward_code", null, dto.toString());
        return AdminResponseFactory.success(request);
    }

    @PostMapping("/{id}/void")
    public String voidCode(@PathVariable String id, HttpServletRequest request) {
        adminMvpService.voidRewardCode(id);
        adminAuditService.logSuccess("reward_codes", "void", "reward_code", id, "{}");
        return AdminResponseFactory.success(request);
    }

    @PostMapping("/{id}/restore")
    public String restoreCode(@PathVariable String id, HttpServletRequest request) {
        adminMvpService.restoreRewardCode(id);
        adminAuditService.logSuccess("reward_codes", "restore", "reward_code", id, "{}");
        return AdminResponseFactory.success(request);
    }
}
