package cn.example.dataserver.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import cn.example.dataserver.entity.TaskLevels;
import cn.example.dataserver.service.TaskLevelsService;
import cn.example.dataserver.mapper.TaskLevelsMapper;
import org.springframework.stereotype.Service;

/**
* @author Partial
* @description 针对表【task_levels(任务等级表)】的数据库操作Service实现
* @createDate 2026-03-18 12:16:43
*/
@Service
public class TaskLevelsServiceImpl extends ServiceImpl<TaskLevelsMapper, TaskLevels>
    implements TaskLevelsService{

}




