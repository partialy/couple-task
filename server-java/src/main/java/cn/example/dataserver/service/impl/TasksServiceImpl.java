package cn.example.dataserver.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import cn.example.dataserver.entity.Tasks;
import cn.example.dataserver.service.TasksService;
import cn.example.dataserver.mapper.TasksMapper;
import org.springframework.stereotype.Service;

/**
* @author Partial
* @description 针对表【tasks(任务表)】的数据库操作Service实现
* @createDate 2026-03-18 12:09:00
*/
@Service
public class TasksServiceImpl extends ServiceImpl<TasksMapper, Tasks>
    implements TasksService{

}




