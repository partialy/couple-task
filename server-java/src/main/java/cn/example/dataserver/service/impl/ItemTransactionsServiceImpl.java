package cn.example.dataserver.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import cn.example.dataserver.entity.ItemTransactions;
import cn.example.dataserver.service.ItemTransactionsService;
import cn.example.dataserver.mapper.ItemTransactionsMapper;
import org.springframework.stereotype.Service;

/**
* @author Partial
* @description 针对表【item_transactions(道具流水表)】的数据库操作Service实现
* @createDate 2026-03-18 12:08:59
*/
@Service
public class ItemTransactionsServiceImpl extends ServiceImpl<ItemTransactionsMapper, ItemTransactions>
    implements ItemTransactionsService{

}




