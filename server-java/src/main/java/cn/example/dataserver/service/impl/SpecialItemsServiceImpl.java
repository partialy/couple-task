package cn.example.dataserver.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import cn.example.dataserver.entity.SpecialItems;
import cn.example.dataserver.service.SpecialItemsService;
import cn.example.dataserver.mapper.SpecialItemsMapper;
import org.springframework.stereotype.Service;

/**
* @author Partial
* @description 针对表【special_items(特别奖励表)】的数据库操作Service实现
* @createDate 2026-03-18 12:08:59
*/
@Service
public class SpecialItemsServiceImpl extends ServiceImpl<SpecialItemsMapper, SpecialItems>
    implements SpecialItemsService{

}




