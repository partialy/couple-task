package cn.example.dataserver.services;

import cn.example.dataserver.common.Result;
import cn.example.dataserver.dto.PartnerOverviewDTO;
import cn.example.dataserver.dto.PublishConfigDTO;
import cn.example.dataserver.dto.UserInitDTO;
import cn.example.dataserver.entity.*;
import cn.example.dataserver.enums.BindingRelation;
import cn.example.dataserver.enums.ItemStatus;
import cn.example.dataserver.service.*;
import cn.hutool.core.util.ObjectUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import cn.example.dataserver.dto.UserUpdateDTO;
import java.util.Arrays;
import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserInfoService {

    private final BindingRelationsService bindingRelationsService;
    private final UsersService usersService;
    private final CategoriesService categoriesService;
    private final TaskLevelsService taskLevelsService;
    private final TasksService tasksService;
    private final UserItemsService userItemsService;
    private final SpecialItemsService specialItemsService;

    public String update(Users user, UserUpdateDTO updateDTO) {
        if (updateDTO.getNickname() != null) user.setNickname(updateDTO.getNickname());
        if (updateDTO.getTitle() != null) user.setTitle(updateDTO.getTitle());
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
                .eq(BindingRelations::getStatus, BindingRelation.ACCEPTED.getValue())
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
                .or()
                .isNull(Categories::getBelongBindingId)
                .groupBy(Categories::getSortOrder)
                .orderByAsc(Categories::getSortOrder)
                .list();
        List<TaskLevels> taskLevelsList = taskLevelsService.lambdaQuery()
                .eq(TaskLevels::getBelongBindingId, bindId)
                .or()
                .eq(TaskLevels::getBelongBindingId, "")
                .or()
                .isNull(TaskLevels::getBelongBindingId)
                .list();
        PublishConfigDTO publishConfigDTO = PublishConfigDTO.builder()
                .categories(categoriesList)
                .taskLevels(taskLevelsList)
                .build();
        return Result.success(publishConfigDTO).toJson();
    }

    /**
     * 当前用户绑定对象的资料与统计（仅服务端解析伴侣 ID，避免越权查询）
     */
    public String partnerOverview(Users user) {
        BindingRelations bind = bindingRelationsService.lambdaQuery()
                .and(wrapper -> wrapper.eq(BindingRelations::getUserId, user.getId())
                        .or().eq(BindingRelations::getTargetId, user.getId()))
                .eq(BindingRelations::getStatus, BindingRelation.ACCEPTED.getValue())
                .one();
        if (ObjectUtil.isNull(bind)) {
            return Result.fail("暂无绑定对象").toJson();
        }
        String partnerId = bind.getUserId().equals(user.getId()) ? bind.getTargetId() : bind.getUserId();
        Users partner = usersService.getById(partnerId);
        if (ObjectUtil.isNull(partner)) {
            return Result.fail("绑定对象不存在").toJson();
        }
        partner.setPassword(null);

        long tasksPublished = tasksService.lambdaQuery()
                .eq(Tasks::getAuthorId, partnerId)
                .isNull(Tasks::getDeletedAt)
                .count();

        long tasksReceivedCompleted = tasksService.lambdaQuery()
                .eq(Tasks::getReceiverId, partnerId)
                .eq(Tasks::getStatus, "completed")
                .isNull(Tasks::getDeletedAt)
                .count();

        long tasksReceivedOngoing = tasksService.lambdaQuery()
                .eq(Tasks::getReceiverId, partnerId)
                .in(Tasks::getStatus, Arrays.asList("accepted", "in-progress"))
                .isNull(Tasks::getDeletedAt)
                .count();

        long tasksReceivedPending = tasksService.lambdaQuery()
                .eq(Tasks::getReceiverId, partnerId)
                .eq(Tasks::getStatus, "pending")
                .isNull(Tasks::getDeletedAt)
                .count();

        long usableItemCount = userItemsService.lambdaQuery()
                .eq(UserItems::getUserId, partnerId)
                .eq(UserItems::getStatus, ItemStatus.USABLE.getValue())
                .count();

        long specialRewardsPublished = specialItemsService.lambdaQuery()
                .eq(SpecialItems::getBelongBindingId, bind.getId())
                .eq(SpecialItems::getPublishUserId, partnerId)
                .isNull(SpecialItems::getDeletedAt)
                .count();

        PartnerOverviewDTO dto = PartnerOverviewDTO.builder()
                .profile(partner)
                .points(partner.getPoints() != null ? partner.getPoints() : 0)
                .cards(partner.getCards() != null ? partner.getCards() : 0)
                .tasksPublished(tasksPublished)
                .tasksReceivedCompleted(tasksReceivedCompleted)
                .tasksReceivedOngoing(tasksReceivedOngoing)
                .tasksReceivedPending(tasksReceivedPending)
                .usableItemCount(usableItemCount)
                .specialRewardsPublished(specialRewardsPublished)
                .build();
        return Result.success(dto).toJson();
    }
}
