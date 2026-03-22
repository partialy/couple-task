package cn.example.dataserver.controller;

import cn.example.dataserver.services.CardTransactionsServiceImplements;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 万能卡流水接口
 */
@CrossOrigin
@RestController
@RequestMapping("/card-transactions")
@RequiredArgsConstructor
public class CardTransactionsController {

    private final CardTransactionsServiceImplements cardTransactionsServiceImplements;

    /**
     * 分页查询当前用户万能卡流水
     */
    @GetMapping("/page")
    public String page(
            @RequestHeader("Authorization") String token,
            @RequestParam(defaultValue = "1") Long page,
            @RequestParam(defaultValue = "10") Long size
    ) {
        return cardTransactionsServiceImplements.pageList(token, page, size);
    }
}
