package cn.example.dataserver.services;

import cn.example.dataserver.common.Result;
import cn.example.dataserver.dto.PublishConfigDTO;
import cn.example.dataserver.dto.UserInitDTO;
import cn.example.dataserver.entity.*;
import cn.example.dataserver.service.*;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import cn.example.dataserver.dto.UserUpdateDTO;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserInfoService {

    private final BindingRelationsService bindingRelationsService;
    private final UsersService usersService;
    private final CategoriesService categoriesService;
    private final TaskLevelsService taskLevelsService;

    public String update(Users user, UserUpdateDTO updateDTO) {
        if (updateDTO.getNickname() != null) user.setNickname(updateDTO.getNickname());
        if (updateDTO.getAvatar() != null) user.setAvatar(updateDTO.getAvatar());
        if (updateDTO.getGender() != null) user.setGender(updateDTO.getGender());
        if (updateDTO.getBirthday() != null) user.setBirthday(updateDTO.getBirthday());
        if (updateDTO.getAnniversary() != null) user.setAnniversary(updateDTO.getAnniversary());
        if (updateDTO.getLocation() != null) user.setLocation(updateDTO.getLocation());
        
        user.setUpdatedAt(new Date());
        usersService.updateById(user);
        
        return Result.success(user).toJson();
    }

    public String detail(Users user) {
        BindingRelations bind = bindingRelationsService.lambdaQuery()
                .and(wrapper -> wrapper.eq(BindingRelations::getUserId, user.getId())
                        .or().eq(BindingRelations::getTargetId, user.getId()))
                .eq(BindingRelations::getStatus, "accepted")
                .one();
        Users bindUser = null;
        if(bind != null) {
            String bindUserId = bind.getUserId().equals(user.getId()) ? bind.getTargetId() : bind.getUserId();
            bindUser = usersService.getById(bindUserId);
        }
        user.setPassword(null);
        UserInitDTO userInitDTO = UserInitDTO.builder()
                .user(user)
                .bindUser(bindUser)
                .bindingRelations(bind)
                .isBinding(bind != null)
                .build();
        return Result.success(userInitDTO).toJson();
    }

    public String publishConfig(Users user, String bindId) {
        List<Categories> categoriesList = categoriesService.lambdaQuery()
                .eq(Categories::getBelongBindingId, bindId)
                .or()
                .eq(Categories::getBelongBindingId, "")
                .groupBy(Categories::getSortOrder)
                .orderByAsc(Categories::getSortOrder)
                .list();
        List<TaskLevels> taskLevelsList = taskLevelsService.lambdaQuery()
                .eq(TaskLevels::getBelongBindingId, bindId)
                .or()
                .eq(TaskLevels::getBelongBindingId, "")
                .list();
        PublishConfigDTO publishConfigDTO = PublishConfigDTO.builder()
                .categories(categoriesList)
                .taskLevels(taskLevelsList)
                .build();
        return Result.success(publishConfigDTO).toJson();
    }
}
