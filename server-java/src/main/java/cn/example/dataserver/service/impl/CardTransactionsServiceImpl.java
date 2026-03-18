package cn.example.dataserver.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import cn.example.dataserver.entity.CardTransactions;
import cn.example.dataserver.service.CardTransactionsService;
import cn.example.dataserver.mapper.CardTransactionsMapper;
import org.springframework.stereotype.Service;

/**
* @author Partial
* @description 针对表【card_transactions(万能卡流水表)】的数据库操作Service实现
* @createDate 2026-03-18 12:08:59
*/
@Service
public class CardTransactionsServiceImpl extends ServiceImpl<CardTransactionsMapper, CardTransactions>
    implements CardTransactionsService{

}




