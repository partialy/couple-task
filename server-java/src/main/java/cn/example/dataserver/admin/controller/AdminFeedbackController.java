package cn.example.dataserver.admin.controller;

import cn.example.dataserver.admin.common.AdminResponseFactory;
import cn.example.dataserver.admin.dto.AdminFeedbackProcessDTO;
import cn.example.dataserver.admin.dto.AdminPageQueryDTO;
import cn.example.dataserver.admin.services.AdminAuditService;
import cn.example.dataserver.admin.services.AdminGovernanceService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/v1/feedbacks")
@RequiredArgsConstructor
public class AdminFeedbackController {

    private final AdminGovernanceService adminGovernanceService;
    private final AdminAuditService adminAuditService;

    @GetMapping
    public String pageFeedbacks(AdminPageQueryDTO queryDTO, HttpServletRequest request) {
        return AdminResponseFactory.success(request, adminGovernanceService.pageFeedbacks(queryDTO));
    }

    @GetMapping("/{id}")
    public String getFeedback(@PathVariable String id, HttpServletRequest request) {
        return AdminResponseFactory.success(request, adminGovernanceService.getFeedback(id));
    }

    @PostMapping("/{id}/process")
    public String processFeedback(
            @PathVariable String id, @RequestBody AdminFeedbackProcessDTO dto, HttpServletRequest request) {
        adminGovernanceService.processFeedback(id, dto);
        adminAuditService.logSuccess("feedback", "process", "feedback", id, dto.toString());
        return AdminResponseFactory.success(request);
    }
}
