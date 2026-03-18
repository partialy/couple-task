package cn.example.dataserver.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import cn.example.dataserver.entity.UserSpecialItems;
import cn.example.dataserver.service.UserSpecialItemsService;
import cn.example.dataserver.mapper.UserSpecialItemsMapper;
import org.springframework.stereotype.Service;

/**
* @author Partial
* @description 针对表【user_special_items(用户特别奖励表)】的数据库操作Service实现
* @createDate 2026-03-18 12:09:00
*/
@Service
public class UserSpecialItemsServiceImpl extends ServiceImpl<UserSpecialItemsMapper, UserSpecialItems>
    implements UserSpecialItemsService{

}




