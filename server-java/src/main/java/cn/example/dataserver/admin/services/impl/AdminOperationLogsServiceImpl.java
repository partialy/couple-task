package cn.example.dataserver.admin.services.impl;

import cn.example.dataserver.admin.entity.AdminOperationLogs;
import cn.example.dataserver.admin.mapper.AdminOperationLogsMapper;
import cn.example.dataserver.admin.services.AdminOperationLogsService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

@Service
public class AdminOperationLogsServiceImpl extends ServiceImpl<AdminOperationLogsMapper, AdminOperationLogs>
        implements AdminOperationLogsService {
}
