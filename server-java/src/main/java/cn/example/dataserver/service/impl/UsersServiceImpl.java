package cn.example.dataserver.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import cn.example.dataserver.entity.Users;
import cn.example.dataserver.service.UsersService;
import cn.example.dataserver.mapper.UsersMapper;
import org.springframework.stereotype.Service;

/**
* @author Partial
* @description 针对表【users(用户表)】的数据库操作Service实现
* @createDate 2026-03-18 12:14:14
*/
@Service
public class UsersServiceImpl extends ServiceImpl<UsersMapper, Users>
    implements UsersService{

}




