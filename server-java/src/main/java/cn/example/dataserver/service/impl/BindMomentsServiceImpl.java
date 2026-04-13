package cn.example.dataserver.service.impl;

import cn.example.dataserver.entity.BindMoments;
import cn.example.dataserver.mapper.BindMomentsMapper;
import cn.example.dataserver.service.BindMomentsService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

@Service
public class BindMomentsServiceImpl extends ServiceImpl<BindMomentsMapper, BindMoments> implements BindMomentsService {
}
