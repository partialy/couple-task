package cn.example.dataserver.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import cn.example.dataserver.entity.UserAchievements;
import cn.example.dataserver.service.UserAchievementsService;
import cn.example.dataserver.mapper.UserAchievementsMapper;
import org.springframework.stereotype.Service;

/**
* @author Partial
* @description 针对表【user_achievements(用户成就解锁表)】的数据库操作Service实现
* @createDate 2026-03-18 12:09:00
*/
@Service
public class UserAchievementsServiceImpl extends ServiceImpl<UserAchievementsMapper, UserAchievements>
    implements UserAchievementsService{

}




