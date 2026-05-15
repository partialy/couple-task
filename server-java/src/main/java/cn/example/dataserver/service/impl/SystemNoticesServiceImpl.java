package cn.example.dataserver.service.impl;

import cn.example.dataserver.entity.SystemNotices;
import cn.example.dataserver.mapper.SystemNoticesMapper;
import cn.example.dataserver.service.SystemNoticesService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

@Service
public class SystemNoticesServiceImpl extends ServiceImpl<SystemNoticesMapper, SystemNotices>
        implements SystemNoticesService {
}