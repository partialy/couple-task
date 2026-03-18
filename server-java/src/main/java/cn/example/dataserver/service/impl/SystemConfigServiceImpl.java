package cn.example.dataserver.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import cn.example.dataserver.entity.SystemConfig;
import cn.example.dataserver.service.SystemConfigService;
import cn.example.dataserver.mapper.SystemConfigMapper;
import org.springframework.stereotype.Service;

/**
* @author Partial
* @description 针对表【system_config(系统配置表)】的数据库操作Service实现
* @createDate 2026-03-18 12:09:00
*/
@Service
public class SystemConfigServiceImpl extends ServiceImpl<SystemConfigMapper, SystemConfig>
    implements SystemConfigService{

}




