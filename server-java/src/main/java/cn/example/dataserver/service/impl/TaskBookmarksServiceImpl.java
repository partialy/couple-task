package cn.example.dataserver.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import cn.example.dataserver.entity.TaskBookmarks;
import cn.example.dataserver.service.TaskBookmarksService;
import cn.example.dataserver.mapper.TaskBookmarksMapper;
import org.springframework.stereotype.Service;

/**
* @author Partial
* @description 针对表【task_bookmarks(任务收藏表)】的数据库操作Service实现
* @createDate 2026-03-18 12:09:00
*/
@Service
public class TaskBookmarksServiceImpl extends ServiceImpl<TaskBookmarksMapper, TaskBookmarks>
    implements TaskBookmarksService{

}




