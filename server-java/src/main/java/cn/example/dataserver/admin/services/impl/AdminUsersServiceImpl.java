package cn.example.dataserver.admin.services.impl;

import cn.example.dataserver.admin.entity.AdminUsers;
import cn.example.dataserver.admin.mapper.AdminUsersMapper;
import cn.example.dataserver.admin.services.AdminUsersService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

@Service
public class AdminUsersServiceImpl extends ServiceImpl<AdminUsersMapper, AdminUsers> implements AdminUsersService {
}
