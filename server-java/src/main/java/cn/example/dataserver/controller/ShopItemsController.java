package cn.example.dataserver.controller;

import cn.example.dataserver.dto.ShopItemPublishDTO;
import cn.example.dataserver.services.ShopItemsServiceImplements;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 积分商城商品
 */
@CrossOrigin
@RestController
@RequestMapping("/shop-items")
@RequiredArgsConstructor
public class ShopItemsController {

    private final ShopItemsServiceImplements shopItemsServiceImplements;

    /**
     * 积分兑换可见列表
     */
    @GetMapping("/redeem")
    public String listForRedeem(@RequestHeader("Authorization") String token) {
        return shopItemsServiceImplements.listForRedeem(token);
    }

    /**
     * 给 TA 发布：当前用户发布的商品（可编辑）
     */
    @GetMapping("/my-published")
    public String listForPublish(@RequestHeader("Authorization") String token) {
        return shopItemsServiceImplements.listForPublish(token);
    }

    @PostMapping
    public String publish(@RequestHeader("Authorization") String token, @RequestBody ShopItemPublishDTO dto) {
        return shopItemsServiceImplements.publish(token, dto);
    }

    @PutMapping("/{id}")
    public String update(
            @RequestHeader("Authorization") String token,
            @PathVariable String id,
            @RequestBody ShopItemPublishDTO dto
    ) {
        return shopItemsServiceImplements.update(token, id, dto);
    }

    @DeleteMapping("/{id}")
    public String delete(@RequestHeader("Authorization") String token, @PathVariable String id) {
        return shopItemsServiceImplements.delete(token, id);
    }
}
