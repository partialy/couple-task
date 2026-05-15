package cn.example.dataserver.service.impl;

import cn.example.dataserver.entity.WishItems;
import cn.example.dataserver.mapper.WishItemsMapper;
import cn.example.dataserver.service.WishItemsService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

/**
 * 心愿条目表 Service 实现
 */
@Service
public class WishItemsServiceImpl extends ServiceImpl<WishItemsMapper, WishItems> implements WishItemsService {

}
