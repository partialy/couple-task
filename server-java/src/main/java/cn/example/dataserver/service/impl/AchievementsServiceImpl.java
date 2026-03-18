package cn.example.dataserver.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import cn.example.dataserver.entity.Achievements;
import cn.example.dataserver.service.AchievementsService;
import cn.example.dataserver.mapper.AchievementsMapper;
import org.springframework.stereotype.Service;

/**
* @author Partial
* @description 针对表【achievements(成就表)】的数据库操作Service实现
* @createDate 2026-03-18 12:08:59
*/
@Service
public class AchievementsServiceImpl extends ServiceImpl<AchievementsMapper, Achievements>
    implements AchievementsService{

}




