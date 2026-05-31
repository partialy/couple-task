package cn.example.dataserver.admin.controller;

import cn.example.dataserver.admin.common.AdminResponseFactory;
import cn.example.dataserver.admin.services.AdminDashboardService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/v1/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    @GetMapping("/overview")
    public String overview(HttpServletRequest request) {
        return AdminResponseFactory.success(request, adminDashboardService.overview());
    }

    @GetMapping("/trends")
    public String trends(HttpServletRequest request) {
        return AdminResponseFactory.success(request, adminDashboardService.trends());
    }

    @GetMapping("/distributions")
    public String distributions(HttpServletRequest request) {
        return AdminResponseFactory.success(request, adminDashboardService.distributions());
    }

    @GetMapping("/rankings")
    public String rankings(HttpServletRequest request) {
        return AdminResponseFactory.success(request, adminDashboardService.rankings());
    }

    @GetMapping("/alerts")
    public String alerts(HttpServletRequest request) {
        return AdminResponseFactory.success(request, adminDashboardService.alerts());
    }

    @GetMapping("/todos")
    public String todos(HttpServletRequest request) {
        return AdminResponseFactory.success(request, adminDashboardService.todos());
    }
}
