package cn.example.dataserver.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import cn.example.dataserver.entity.Messages;
import cn.example.dataserver.service.MessagesService;
import cn.example.dataserver.mapper.MessagesMapper;
import org.springframework.stereotype.Service;

/**
* @author Partial
* @description 针对表【messages(消息表)】的数据库操作Service实现
* @createDate 2026-03-18 12:08:59
*/
@Service
public class MessagesServiceImpl extends ServiceImpl<MessagesMapper, Messages>
    implements MessagesService{

}




