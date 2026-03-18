package cn.example.dataserver.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import cn.example.dataserver.entity.UserSettings;
import cn.example.dataserver.service.UserSettingsService;
import cn.example.dataserver.mapper.UserSettingsMapper;
import org.springframework.stereotype.Service;

/**
* @author Partial
* @description 针对表【user_settings(用户设置表)】的数据库操作Service实现
* @createDate 2026-03-18 12:09:00
*/
@Service
public class UserSettingsServiceImpl extends ServiceImpl<UserSettingsMapper, UserSettings>
    implements UserSettingsService{

}




