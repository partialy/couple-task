package cn.example.dataserver.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import cn.example.dataserver.entity.RewardCodes;
import cn.example.dataserver.service.RewardCodesService;
import cn.example.dataserver.mapper.RewardCodesMapper;
import org.springframework.stereotype.Service;

/**
* @author Partial
* @description 针对表【reward_codes(奖励兑换码表)】的数据库操作Service实现
* @createDate 2026-03-18 12:08:59
*/
@Service
public class RewardCodesServiceImpl extends ServiceImpl<RewardCodesMapper, RewardCodes>
    implements RewardCodesService{

}




