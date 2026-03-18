package cn.example.dataserver.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import cn.example.dataserver.entity.AchievementCategories;
import cn.example.dataserver.service.AchievementCategoriesService;
import cn.example.dataserver.mapper.AchievementCategoriesMapper;
import org.springframework.stereotype.Service;

/**
* @author Partial
* @description 针对表【achievement_categories(成就分类表)】的数据库操作Service实现
* @createDate 2026-03-18 12:08:59
*/
@Service
public class AchievementCategoriesServiceImpl extends ServiceImpl<AchievementCategoriesMapper, AchievementCategories>
    implements AchievementCategoriesService{

}




