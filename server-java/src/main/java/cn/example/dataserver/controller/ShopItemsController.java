package cn.example.dataserver.controller;

import cn.example.dataserver.common.Result;
import cn.example.dataserver.entity.ShopItems;
import cn.example.dataserver.service.ShopItemsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/shop-items")
@RequiredArgsConstructor
public class ShopItemsController {

    private final ShopItemsService shopItemsService;

    @GetMapping
    public String getShopItems() {
        List<ShopItems> items = shopItemsService.lambdaQuery()
                .eq(ShopItems::getStatus, "active")
                .list();
        return Result.success(items).toJson();
    }
}
