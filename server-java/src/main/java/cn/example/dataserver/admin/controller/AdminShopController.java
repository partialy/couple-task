package cn.example.dataserver.admin.controller;

import cn.example.dataserver.admin.common.AdminResponseFactory;
import cn.example.dataserver.admin.dto.AdminPageQueryDTO;
import cn.example.dataserver.admin.dto.AdminStatusUpdateDTO;
import cn.example.dataserver.admin.services.AdminAuditService;
import cn.example.dataserver.admin.services.AdminMvpService;
import cn.example.dataserver.entity.ShopItems;
import cn.example.dataserver.entity.SpecialItems;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/admin/v1")
@RequiredArgsConstructor
public class AdminShopController {

    private final AdminMvpService adminMvpService;
    private final AdminAuditService adminAuditService;

    @GetMapping("/shop-items")
    public String pageShopItems(AdminPageQueryDTO queryDTO, HttpServletRequest request) {
        return AdminResponseFactory.success(request, adminMvpService.pageShopItems(queryDTO));
    }

    @PostMapping("/shop-items")
    public String createShopItem(@RequestBody ShopItems payload, HttpServletRequest request) {
        return AdminResponseFactory.success(request, adminMvpService.createShopItem(payload));
    }

    @PutMapping("/shop-items/{id}")
    public String updateShopItem(@PathVariable String id, @RequestBody ShopItems payload, HttpServletRequest request) {
        return AdminResponseFactory.success(request, adminMvpService.updateShopItem(id, payload));
    }

    @PostMapping("/shop-items/{id}/status")
    public String updateShopItemStatus(@PathVariable String id, @RequestBody AdminStatusUpdateDTO dto, HttpServletRequest request) {
        adminMvpService.updateShopItemStatus(id, dto);
        adminAuditService.logSuccess("shop", "update_shop_item_status", "shop_item", id, dto.toString());
        return AdminResponseFactory.success(request);
    }

    @GetMapping("/special-items")
    public String pageSpecialItems(AdminPageQueryDTO queryDTO, HttpServletRequest request) {
        return AdminResponseFactory.success(request, adminMvpService.pageSpecialItems(queryDTO));
    }

    @PostMapping("/special-items")
    public String createSpecialItem(@RequestBody SpecialItems payload, HttpServletRequest request) {
        return AdminResponseFactory.success(request, adminMvpService.createSpecialItem(payload));
    }

    @PutMapping("/special-items/{id}")
    public String updateSpecialItem(@PathVariable String id, @RequestBody SpecialItems payload, HttpServletRequest request) {
        return AdminResponseFactory.success(request, adminMvpService.updateSpecialItem(id, payload));
    }

    @PostMapping("/special-items/{id}/status")
    public String updateSpecialItemStatus(@PathVariable String id, @RequestBody AdminStatusUpdateDTO dto, HttpServletRequest request) {
        adminMvpService.updateSpecialItemStatus(id, dto);
        adminAuditService.logSuccess("shop", "update_special_item_status", "special_item", id, dto.toString());
        return AdminResponseFactory.success(request);
    }

    @GetMapping("/user-items")
    public String pageUserItems(AdminPageQueryDTO queryDTO, HttpServletRequest request) {
        return AdminResponseFactory.success(request, adminMvpService.pageUserItems(queryDTO));
    }

    @PostMapping("/user-items/verify")
    public String verifyUserItem(@RequestBody Map<String, String> payload, HttpServletRequest request) {
        adminMvpService.verifyUserItem(payload.get("code"), payload.get("remark"));
        adminAuditService.logSuccess("shop", "verify_user_item", "user_item", payload.get("code"), payload.toString());
        return AdminResponseFactory.success(request);
    }

    @GetMapping("/item-redemption-records")
    public String pageItemRedemptionRecords(AdminPageQueryDTO queryDTO, HttpServletRequest request) {
        return AdminResponseFactory.success(request, adminMvpService.pageRedemptionRecords(queryDTO));
    }
}
