package cn.example.dataserver.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import cn.example.dataserver.entity.Categories;
import cn.example.dataserver.service.CategoriesService;
import cn.example.dataserver.mapper.CategoriesMapper;
import org.springframework.stereotype.Service;

/**
* @author Partial
* @description 针对表【categories(任务分类表)】的数据库操作Service实现
* @createDate 2026-03-18 12:08:59
*/
@Service
public class CategoriesServiceImpl extends ServiceImpl<CategoriesMapper, Categories>
    implements CategoriesService{

}




