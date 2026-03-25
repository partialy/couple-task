package cn.example.dataserver.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import cn.example.dataserver.entity.CheckinPlans;
import cn.example.dataserver.service.CheckinPlansService;
import cn.example.dataserver.mapper.CheckinPlansMapper;
import org.springframework.stereotype.Service;

/**
 * 签到计划配置表 Service 实现
 */
@Service
public class CheckinPlansServiceImpl extends ServiceImpl<CheckinPlansMapper, CheckinPlans>
    implements CheckinPlansService {

}
