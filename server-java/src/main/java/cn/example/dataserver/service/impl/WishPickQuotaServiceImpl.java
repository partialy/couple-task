package cn.example.dataserver.service.impl;

import cn.example.dataserver.entity.WishPickQuota;
import cn.example.dataserver.mapper.WishPickQuotaMapper;
import cn.example.dataserver.service.WishPickQuotaService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

/**
 * 心愿摘取次数表 Service 实现
 */
@Service
public class WishPickQuotaServiceImpl extends ServiceImpl<WishPickQuotaMapper, WishPickQuota>
        implements WishPickQuotaService {

}
