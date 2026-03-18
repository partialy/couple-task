package cn.example.dataserver.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import cn.example.dataserver.entity.TaskTemplates;
import cn.example.dataserver.service.TaskTemplatesService;
import cn.example.dataserver.mapper.TaskTemplatesMapper;
import org.springframework.stereotype.Service;

/**
* @author Partial
* @description 针对表【task_templates(任务模板库表)】的数据库操作Service实现
* @createDate 2026-03-18 12:09:00
*/
@Service
public class TaskTemplatesServiceImpl extends ServiceImpl<TaskTemplatesMapper, TaskTemplates>
    implements TaskTemplatesService{

}




