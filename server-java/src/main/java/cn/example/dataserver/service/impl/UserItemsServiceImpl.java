package cn.example.dataserver.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import cn.example.dataserver.entity.UserItems;
import cn.example.dataserver.service.UserItemsService;
import cn.example.dataserver.mapper.UserItemsMapper;
import org.springframework.stereotype.Service;

/**
* @author Partial
* @description 针对表【user_items(用户道具/背包表)】的数据库操作Service实现
* @createDate 2026-03-22 13:08:17
*/
@Service
public class UserItemsServiceImpl extends ServiceImpl<UserItemsMapper, UserItems>
    implements UserItemsService{

}




