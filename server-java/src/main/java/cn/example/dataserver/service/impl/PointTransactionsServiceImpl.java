package cn.example.dataserver.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import cn.example.dataserver.entity.PointTransactions;
import cn.example.dataserver.service.PointTransactionsService;
import cn.example.dataserver.mapper.PointTransactionsMapper;
import org.springframework.stereotype.Service;

/**
* @author Partial
* @description 针对表【point_transactions(积分流水表)】的数据库操作Service实现
* @createDate 2026-03-18 12:08:59
*/
@Service
public class PointTransactionsServiceImpl extends ServiceImpl<PointTransactionsMapper, PointTransactions>
    implements PointTransactionsService{

}




