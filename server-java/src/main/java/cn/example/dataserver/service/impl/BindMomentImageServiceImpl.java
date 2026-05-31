package cn.example.dataserver.service.impl;

import cn.example.dataserver.entity.BindMomentImage;
import cn.example.dataserver.mapper.BindMomentImageMapper;
import cn.example.dataserver.service.BindMomentImageService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

@Service
public class BindMomentImageServiceImpl extends ServiceImpl<BindMomentImageMapper, BindMomentImage>
        implements BindMomentImageService {
}
