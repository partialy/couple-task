package cn.example.dataserver.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import cn.example.dataserver.entity.TaskImages;
import cn.example.dataserver.service.TaskImagesService;
import cn.example.dataserver.mapper.TaskImagesMapper;
import org.springframework.stereotype.Service;

/**
* @author Partial
* @description 针对表【task_images(任务图片表)】的数据库操作Service实现
* @createDate 2026-03-18 12:09:00
*/
@Service
public class TaskImagesServiceImpl extends ServiceImpl<TaskImagesMapper, TaskImages>
    implements TaskImagesService{

}




