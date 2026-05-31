package cn.example.dataserver.admin.controller;

import cn.example.dataserver.admin.common.AdminResponseFactory;
import cn.example.dataserver.admin.dto.AdminPageQueryDTO;
import cn.example.dataserver.admin.services.AdminMvpService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/v1/transactions")
@RequiredArgsConstructor
public class AdminTransactionsController {

    private final AdminMvpService adminMvpService;

    @GetMapping("/points")
    public String points(AdminPageQueryDTO queryDTO, HttpServletRequest request) {
        return AdminResponseFactory.success(request, adminMvpService.pagePointTransactions(queryDTO));
    }

    @GetMapping("/cards")
    public String cards(AdminPageQueryDTO queryDTO, HttpServletRequest request) {
        return AdminResponseFactory.success(request, adminMvpService.pageCardTransactions(queryDTO));
    }

    @GetMapping("/items")
    public String items(AdminPageQueryDTO queryDTO, HttpServletRequest request) {
        return AdminResponseFactory.success(request, adminMvpService.pageItemTransactions(queryDTO));
    }
}
