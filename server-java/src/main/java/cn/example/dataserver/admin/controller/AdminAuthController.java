package cn.example.dataserver.admin.controller;

import cn.example.dataserver.admin.common.AdminAuthContext;
import cn.example.dataserver.admin.common.AdminResponseFactory;
import cn.example.dataserver.admin.dto.AdminLoginDTO;
import cn.example.dataserver.admin.services.AdminAuthService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/v1/auth")
@RequiredArgsConstructor
public class AdminAuthController {

    private final AdminAuthService adminAuthService;

    @PostMapping("/login")
    public String login(@RequestBody AdminLoginDTO loginDTO, HttpServletRequest request) {
        return AdminResponseFactory.success(request, adminAuthService.login(loginDTO));
    }

    @PostMapping("/logout")
    public String logout(HttpServletRequest request) {
        return AdminResponseFactory.success(request);
    }

    @GetMapping("/me")
    public String me(HttpServletRequest request) {
        return AdminResponseFactory.success(request, adminAuthService.me(AdminAuthContext.getAdminId()));
    }
}
