package cn.example.dataserver.controller;

import cn.example.dataserver.services.PointsServiceImplements;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequestMapping("/points")
@RequiredArgsConstructor
public class PointsController {

    private final PointsServiceImplements pointsService;

    @GetMapping("/history")
    public String getHistory(@RequestHeader("Authorization") String token) {
        return pointsService.getHistory(token);
    }

    @PostMapping("/redeem-code")
    public String redeemCode(@RequestHeader("Authorization") String token, @RequestParam String code) {
        return pointsService.redeemCode(token, code);
    }

    @PostMapping("/redeem-item/{itemId}")
    public String redeemItem(@RequestHeader("Authorization") String token, @PathVariable String itemId) {
        return pointsService.redeemItem(token, itemId);
    }
}
