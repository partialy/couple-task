package cn.example.dataserver.admin.controller;

import cn.example.dataserver.admin.common.AdminResponseFactory;
import cn.example.dataserver.admin.dto.AdminPageQueryDTO;
import cn.example.dataserver.admin.dto.AdminStatusUpdateDTO;
import cn.example.dataserver.admin.services.AdminAuditService;
import cn.example.dataserver.admin.services.AdminMvpService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/v1")
@RequiredArgsConstructor
public class AdminTasksController {

    private final AdminMvpService adminMvpService;
    private final AdminAuditService adminAuditService;

    @GetMapping("/tasks")
    public String pageTasks(AdminPageQueryDTO queryDTO, HttpServletRequest request) {
        return AdminResponseFactory.success(request, adminMvpService.pageTasks(queryDTO));
    }

    @GetMapping("/tasks/{id}")
    public String getTask(@PathVariable String id, HttpServletRequest request) {
        return AdminResponseFactory.success(request, adminMvpService.getTask(id));
    }

    @PostMapping("/tasks/{id}/status")
    public String updateTaskStatus(@PathVariable String id, @RequestBody AdminStatusUpdateDTO dto, HttpServletRequest request) {
        adminMvpService.updateTaskStatus(id, dto);
        adminAuditService.logSuccess("tasks", "update_status", "task", id, dto.toString());
        return AdminResponseFactory.success(request);
    }

    @PostMapping("/tasks/{id}/listing-status")
    public String updateTaskListingStatus(@PathVariable String id, @RequestBody AdminStatusUpdateDTO dto, HttpServletRequest request) {
        adminMvpService.updateTaskListingStatus(id, dto);
        adminAuditService.logSuccess("tasks", "update_listing_status", "task", id, dto.toString());
        return AdminResponseFactory.success(request);
    }

    @GetMapping("/task-comments")
    public String pageTaskComments(AdminPageQueryDTO queryDTO, HttpServletRequest request) {
        return AdminResponseFactory.success(request, adminMvpService.pageTaskComments(queryDTO));
    }

    @PostMapping("/task-comments/{id}/delete")
    public String deleteTaskComment(@PathVariable String id, HttpServletRequest request) {
        adminMvpService.deleteTaskComment(id);
        adminAuditService.logSuccess("tasks", "delete_comment", "task_comment", id, "{}");
        return AdminResponseFactory.success(request);
    }

    @PostMapping("/task-comments/{id}/restore")
    public String restoreTaskComment(@PathVariable String id, HttpServletRequest request) {
        adminMvpService.restoreTaskComment(id);
        adminAuditService.logSuccess("tasks", "restore_comment", "task_comment", id, "{}");
        return AdminResponseFactory.success(request);
    }

    @GetMapping("/task-templates")
    public String pageTaskTemplates(AdminPageQueryDTO queryDTO, HttpServletRequest request) {
        return AdminResponseFactory.success(request, adminMvpService.pageTaskTemplates(queryDTO));
    }

    @PostMapping("/task-templates/{id}/audit")
    public String auditTaskTemplate(@PathVariable String id, @RequestBody AdminStatusUpdateDTO dto, HttpServletRequest request) {
        adminMvpService.auditTaskTemplate(id, dto);
        adminAuditService.logSuccess("tasks", "audit_template", "task_template", id, dto.toString());
        return AdminResponseFactory.success(request);
    }
}
