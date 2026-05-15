package cn.example.dataserver.service.impl;

import cn.example.dataserver.entity.WishItem;
import cn.example.dataserver.mapper.WishItemMapper;
import cn.example.dataserver.service.WishItemService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

/**
 * 心愿条目表 Service 实现
 */
@Service
public class WishItemServiceImpl extends ServiceImpl<WishItemMapper, WishItem> implements WishItemService {

}
