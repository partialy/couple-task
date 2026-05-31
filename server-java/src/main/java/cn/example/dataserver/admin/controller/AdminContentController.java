package cn.example.dataserver.admin.controller;

import cn.example.dataserver.admin.common.AdminResponseFactory;
import cn.example.dataserver.admin.dto.AdminPageQueryDTO;
import cn.example.dataserver.admin.services.AdminAuditService;
import cn.example.dataserver.admin.services.AdminGovernanceService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/v1")
@RequiredArgsConstructor
public class AdminContentController {

    private final AdminGovernanceService adminGovernanceService;
    private final AdminAuditService adminAuditService;

    @GetMapping("/moments")
    public String pageMoments(AdminPageQueryDTO queryDTO, HttpServletRequest request) {
        return AdminResponseFactory.success(request, adminGovernanceService.pageMoments(queryDTO));
    }

    @PostMapping("/moments/{id}/delete")
    public String deleteMoment(@PathVariable String id, HttpServletRequest request) {
        adminGovernanceService.deleteMoment(id);
        adminAuditService.logSuccess("content", "delete_moment", "moment", id, "{}");
        return AdminResponseFactory.success(request);
    }

    @GetMapping("/moment-comments")
    public String pageMomentComments(AdminPageQueryDTO queryDTO, HttpServletRequest request) {
        return AdminResponseFactory.success(request, adminGovernanceService.pageMomentComments(queryDTO));
    }

    @PostMapping("/moment-comments/{id}/delete")
    public String deleteMomentComment(@PathVariable String id, HttpServletRequest request) {
        adminGovernanceService.deleteMomentComment(id);
        adminAuditService.logSuccess("content", "delete_moment_comment", "moment_comment", id, "{}");
        return AdminResponseFactory.success(request);
    }

    @GetMapping("/diaries")
    public String pageDiaries(AdminPageQueryDTO queryDTO, HttpServletRequest request) {
        return AdminResponseFactory.success(request, adminGovernanceService.pageDiaries(queryDTO));
    }

    @PostMapping("/diaries/{id}/delete")
    public String deleteDiary(@PathVariable String id, HttpServletRequest request) {
        adminGovernanceService.deleteDiary(id);
        adminAuditService.logSuccess("content", "delete_diary", "diary", id, "{}");
        return AdminResponseFactory.success(request);
    }
}
