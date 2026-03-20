package cn.example.dataserver.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import cn.example.dataserver.entity.TaskRewards;
import cn.example.dataserver.service.TaskRewardsService;
import cn.example.dataserver.mapper.TaskRewardsMapper;
import org.springframework.stereotype.Service;

/**
* @author Partial
* @description 针对表【task_rewards(任务奖励表)】的数据库操作Service实现
* @createDate 2026-03-20 23:34:04
*/
@Service
public class TaskRewardsServiceImpl extends ServiceImpl<TaskRewardsMapper, TaskRewards>
    implements TaskRewardsService{

}




