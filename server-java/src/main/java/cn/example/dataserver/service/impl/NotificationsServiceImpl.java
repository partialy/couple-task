package cn.example.dataserver.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import cn.example.dataserver.entity.Notifications;
import cn.example.dataserver.service.NotificationsService;
import cn.example.dataserver.mapper.NotificationsMapper;
import org.springframework.stereotype.Service;

/**
* @author Partial
* @description 针对表【notifications(系统通知表)】的数据库操作Service实现
* @createDate 2026-03-18 12:08:59
*/
@Service
public class NotificationsServiceImpl extends ServiceImpl<NotificationsMapper, Notifications>
    implements NotificationsService{

}




