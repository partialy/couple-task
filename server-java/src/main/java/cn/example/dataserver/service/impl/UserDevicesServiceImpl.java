package cn.example.dataserver.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import cn.example.dataserver.entity.UserDevices;
import cn.example.dataserver.service.UserDevicesService;
import cn.example.dataserver.mapper.UserDevicesMapper;
import org.springframework.stereotype.Service;

/**
* @author Partial
* @description 针对表【user_devices(用户设备表)】的数据库操作Service实现
* @createDate 2026-03-18 12:09:00
*/
@Service
public class UserDevicesServiceImpl extends ServiceImpl<UserDevicesMapper, UserDevices>
    implements UserDevicesService{

}




