package cn.example.dataserver.service.impl;

import cn.example.dataserver.entity.DiaryEntries;
import cn.example.dataserver.mapper.DiaryEntriesMapper;
import cn.example.dataserver.service.DiaryEntriesService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

/**
 * 针对表【diary_entries(日记表)】的数据库操作Service实现
 */
@Service
public class DiaryEntriesServiceImpl extends ServiceImpl<DiaryEntriesMapper, DiaryEntries>
        implements DiaryEntriesService {

}
