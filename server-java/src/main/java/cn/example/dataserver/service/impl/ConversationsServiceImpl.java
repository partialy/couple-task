package cn.example.dataserver.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import cn.example.dataserver.entity.Conversations;
import cn.example.dataserver.service.ConversationsService;
import cn.example.dataserver.mapper.ConversationsMapper;
import org.springframework.stereotype.Service;

/**
* @author Partial
* @description 针对表【conversations(会话表)】的数据库操作Service实现
* @createDate 2026-03-18 12:08:59
*/
@Service
public class ConversationsServiceImpl extends ServiceImpl<ConversationsMapper, Conversations>
    implements ConversationsService{

}




