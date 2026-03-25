package cn.example.dataserver.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import cn.example.dataserver.entity.CheckinDayRewards;
import cn.example.dataserver.service.CheckinDayRewardsService;
import cn.example.dataserver.mapper.CheckinDayRewardsMapper;
import org.springframework.stereotype.Service;

/**
 * 签到每日奖励配置表 Service 实现
 */
@Service
public class CheckinDayRewardsServiceImpl extends ServiceImpl<CheckinDayRewardsMapper, CheckinDayRewards>
    implements CheckinDayRewardsService {

}
