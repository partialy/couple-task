package cn.example.dataserver.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import cn.example.dataserver.entity.CheckinRecords;
import cn.example.dataserver.service.CheckinRecordsService;
import cn.example.dataserver.mapper.CheckinRecordsMapper;
import org.springframework.stereotype.Service;

/**
 * 签到打卡记录表 Service 实现
 */
@Service
public class CheckinRecordsServiceImpl extends ServiceImpl<CheckinRecordsMapper, CheckinRecords>
    implements CheckinRecordsService {

}
