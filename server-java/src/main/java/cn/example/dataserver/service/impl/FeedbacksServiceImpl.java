package cn.example.dataserver.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import cn.example.dataserver.entity.Feedbacks;
import cn.example.dataserver.service.FeedbacksService;
import cn.example.dataserver.mapper.FeedbacksMapper;
import org.springframework.stereotype.Service;

/**
* @author Partial
* @description 针对表【feedbacks(用户反馈表)】的数据库操作Service实现
* @createDate 2026-03-18 12:08:59
*/
@Service
public class FeedbacksServiceImpl extends ServiceImpl<FeedbacksMapper, Feedbacks>
    implements FeedbacksService{

}




