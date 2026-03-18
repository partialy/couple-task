package cn.example.dataserver.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import cn.example.dataserver.entity.TaskRewards;
import cn.example.dataserver.service.TaskRewardsService;
import cn.example.dataserver.mapper.TaskRewardsMapper;
import org.springframework.stereotype.Service;

/**
* @author Partial
* @description 针对表【task_rewards(任务奖励表)】的数据库操作Service实现
* @createDate 2026-03-18 12:09:00
*/
@Service
public class TaskRewardsServiceImpl extends ServiceImpl<TaskRewardsMapper, TaskRewards>
    implements TaskRewardsService{

}




