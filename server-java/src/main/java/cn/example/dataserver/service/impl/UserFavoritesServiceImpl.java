package cn.example.dataserver.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import cn.example.dataserver.entity.UserFavorites;
import cn.example.dataserver.service.UserFavoritesService;
import cn.example.dataserver.mapper.UserFavoritesMapper;
import org.springframework.stereotype.Service;

/**
* @author Partial
* @description 针对表【user_favorites(用户收藏表)】的数据库操作Service实现
* @createDate 2026-03-22 16:59:51
*/
@Service
public class UserFavoritesServiceImpl extends ServiceImpl<UserFavoritesMapper, UserFavorites>
    implements UserFavoritesService{

}




