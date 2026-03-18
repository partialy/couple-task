package cn.example.dataserver.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import cn.example.dataserver.entity.Tags;
import cn.example.dataserver.service.TagsService;
import cn.example.dataserver.mapper.TagsMapper;
import org.springframework.stereotype.Service;

/**
* @author Partial
* @description 针对表【tags(标签表)】的数据库操作Service实现
* @createDate 2026-03-18 12:09:00
*/
@Service
public class TagsServiceImpl extends ServiceImpl<TagsMapper, Tags>
    implements TagsService{

}




