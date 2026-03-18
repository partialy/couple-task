package cn.example.dataserver.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import cn.example.dataserver.entity.TaskLogs;
import cn.example.dataserver.service.TaskLogsService;
import cn.example.dataserver.mapper.TaskLogsMapper;
import org.springframework.stereotype.Service;

/**
* @author Partial
* @description 针对表【task_logs(任务状态变更日志表)】的数据库操作Service实现
* @createDate 2026-03-18 12:09:00
*/
@Service
public class TaskLogsServiceImpl extends ServiceImpl<TaskLogsMapper, TaskLogs>
    implements TaskLogsService{

}




