package cn.example.dataserver.service.impl;

import cn.example.dataserver.entity.MemorialDays;
import cn.example.dataserver.mapper.MemorialDaysMapper;
import cn.example.dataserver.service.MemorialDaysService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

/**
 * 针对表【memorial_days(纪念日与倒数日表)】的数据库操作Service实现
 */
@Service
public class MemorialDaysServiceImpl extends ServiceImpl<MemorialDaysMapper, MemorialDays>
        implements MemorialDaysService {

}
