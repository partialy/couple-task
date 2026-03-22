package cn.example.dataserver.services;

import cn.example.dataserver.common.Result;
import cn.example.dataserver.entity.CardTransactions;
import cn.example.dataserver.entity.Users;
import cn.example.dataserver.service.CardTransactionsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;

import java.util.HashMap;
import java.util.Map;

/**
 * 万能卡流水业务实现
 */
@Service
@RequiredArgsConstructor
public class CardTransactionsServiceImplements {

    private final AuthService authService;
    private final CardTransactionsService cardTransactionsService;

    /**
     * 分页查询当前用户的万能卡流水
     */
    public String pageList(String token, long page, long size) {
        Users user = authService.checkToken(token);
        long pageNo = page < 1 ? 1L : page;
        long pageSize = size < 1 ? 10L : Math.min(size, 100L);

        Page<CardTransactions> p = cardTransactionsService.lambdaQuery()
                .eq(CardTransactions::getUserId, user.getId())
                .orderByDesc(CardTransactions::getCreatedAt)
                .page(new Page<>(pageNo, pageSize));

        Map<String, Object> pageData = new HashMap<>(4);
        pageData.put("current", p.getCurrent());
        pageData.put("size", p.getSize());
        pageData.put("total", p.getTotal());
        pageData.put("records", p.getRecords());
        return Result.success(pageData).toJson();
    }
}
