package cn.example.dataserver.service.impl;

import cn.example.dataserver.entity.BindMomentComment;
import cn.example.dataserver.mapper.BindMomentCommentMapper;
import cn.example.dataserver.service.BindMomentCommentService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

@Service
public class BindMomentCommentServiceImpl extends ServiceImpl<BindMomentCommentMapper, BindMomentComment>
        implements BindMomentCommentService {
}
