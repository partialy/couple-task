package cn.example.dataserver.admin.controller;

import cn.example.dataserver.admin.common.AdminResponseFactory;
import cn.example.dataserver.admin.dto.AdminAssetAdjustDTO;
import cn.example.dataserver.admin.dto.AdminPageQueryDTO;
import cn.example.dataserver.admin.dto.AdminStatusUpdateDTO;
import cn.example.dataserver.admin.services.AdminAuditService;
import cn.example.dataserver.admin.services.AdminMvpService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/v1/users")
@RequiredArgsConstructor
public class AdminUsersController {

    private final AdminMvpService adminMvpService;
    private final AdminAuditService adminAuditService;

    @GetMapping
    public String pageUsers(AdminPageQueryDTO queryDTO, HttpServletRequest request) {
        return AdminResponseFactory.success(request, adminMvpService.pageUsers(queryDTO));
    }

    @GetMapping("/{id}")
    public String getUser(@PathVariable String id, HttpServletRequest request) {
        return AdminResponseFactory.success(request, adminMvpService.getUser(id));
    }

    @GetMapping("/{id}/devices")
    public String pageUserDevices(@PathVariable String id, AdminPageQueryDTO queryDTO, HttpServletRequest request) {
        return AdminResponseFactory.success(request, adminMvpService.pageUserDevices(id, queryDTO));
    }

    @PostMapping("/{id}/status")
    public String updateStatus(@PathVariable String id, @RequestBody AdminStatusUpdateDTO dto, HttpServletRequest request) {
        adminMvpService.updateUserStatus(id, dto);
        adminAuditService.logSuccess("users", "update_status", "user", id, dto.toString());
        return AdminResponseFactory.success(request);
    }

    @PostMapping("/{id}/assets/adjust")
    public String adjustAssets(@PathVariable String id, @RequestBody AdminAssetAdjustDTO dto, HttpServletRequest request) {
        adminMvpService.adjustUserAssets(id, dto);
        adminAuditService.logSuccess("users", "adjust_assets", "user", id, dto.toString());
        return AdminResponseFactory.success(request);
    }

    @GetMapping("/bindings")
    public String pageBindings(AdminPageQueryDTO queryDTO, HttpServletRequest request) {
        return AdminResponseFactory.success(request, adminMvpService.pageBindings(queryDTO));
    }
}
