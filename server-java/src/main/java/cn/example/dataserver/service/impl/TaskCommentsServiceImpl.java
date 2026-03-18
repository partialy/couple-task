package cn.example.dataserver.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import cn.example.dataserver.entity.TaskComments;
import cn.example.dataserver.service.TaskCommentsService;
import cn.example.dataserver.mapper.TaskCommentsMapper;
import org.springframework.stereotype.Service;

/**
* @author Partial
* @description 针对表【task_comments(任务评论表)】的数据库操作Service实现
* @createDate 2026-03-18 12:09:00
*/
@Service
public class TaskCommentsServiceImpl extends ServiceImpl<TaskCommentsMapper, TaskComments>
    implements TaskCommentsService{

}




