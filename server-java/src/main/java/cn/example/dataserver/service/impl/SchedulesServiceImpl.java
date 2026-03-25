package cn.example.dataserver.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import cn.example.dataserver.entity.Schedules;
import cn.example.dataserver.service.SchedulesService;
import cn.example.dataserver.mapper.SchedulesMapper;
import org.springframework.stereotype.Service;

/**
 * 针对表【schedules(日程/行程表)】的数据库操作Service实现
 */
@Service
public class SchedulesServiceImpl extends ServiceImpl<SchedulesMapper, Schedules>
    implements SchedulesService {

}
