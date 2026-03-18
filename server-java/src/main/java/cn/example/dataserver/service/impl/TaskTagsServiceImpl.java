package cn.example.dataserver.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import cn.example.dataserver.entity.TaskTags;
import cn.example.dataserver.service.TaskTagsService;
import cn.example.dataserver.mapper.TaskTagsMapper;
import org.springframework.stereotype.Service;

/**
* @author Partial
* @description 针对表【task_tags(任务-标签关联表)】的数据库操作Service实现
* @createDate 2026-03-18 12:09:00
*/
@Service
public class TaskTagsServiceImpl extends ServiceImpl<TaskTagsMapper, TaskTags>
    implements TaskTagsService{

}




