package cn.example.dataserver.service.impl;

import cn.example.dataserver.entity.BindMomentLike;
import cn.example.dataserver.mapper.BindMomentLikeMapper;
import cn.example.dataserver.service.BindMomentLikeService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

@Service
public class BindMomentLikeServiceImpl extends ServiceImpl<BindMomentLikeMapper, BindMomentLike>
        implements BindMomentLikeService {
}
