package cn.example.dataserver.admin.services;

import cn.example.dataserver.admin.common.AdminBusinessException;
import cn.example.dataserver.admin.common.AdminPageResponse;
import cn.example.dataserver.admin.dto.AdminAssetAdjustDTO;
import cn.example.dataserver.admin.dto.AdminPageQueryDTO;
import cn.example.dataserver.admin.dto.AdminRewardCodeBatchGenerateDTO;
import cn.example.dataserver.admin.dto.AdminStatusUpdateDTO;
import cn.example.dataserver.entity.*;
import cn.example.dataserver.service.*;
import cn.hutool.core.date.DateUtil;
import cn.hutool.core.util.ObjectUtil;
import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class AdminMvpService {

    private final UsersService usersService;
    private final UserDevicesService userDevicesService;
    private final BindingRelationsService bindingRelationsService;
    private final TasksService tasksService;
    private final TaskCommentsService taskCommentsService;
    private final TaskTemplatesService taskTemplatesService;
    private final ShopItemsService shopItemsService;
    private final SpecialItemsService specialItemsService;
    private final UserItemsService userItemsService;
    private final ItemRedemptionRecordsService itemRedemptionRecordsService;
    private final RewardCodesService rewardCodesService;
    private final PointTransactionsService pointTransactionsService;
    private final CardTransactionsService cardTransactionsService;
    private final ItemTransactionsService itemTransactionsService;

    public AdminPageResponse<Users> pageUsers(AdminPageQueryDTO queryDTO) {
        Page<Users> page = usersService.page(new Page<>(queryDTO.getPage(), queryDTO.getPageSize()),
                buildUsersQuery(queryDTO));
        return toPage(page);
    }

    public Users getUser(String id) {
        Users user = usersService.getById(id);
        if (user == null) {
            throw new AdminBusinessException("用户不存在");
        }
        return user;
    }

    public AdminPageResponse<UserDevices> pageUserDevices(String userId, AdminPageQueryDTO queryDTO) {
        LambdaQueryWrapper<UserDevices> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserDevices::getUserId, userId).orderByDesc(UserDevices::getLastActiveAt);
        return toPage(userDevicesService.page(new Page<>(queryDTO.getPage(), queryDTO.getPageSize()), wrapper));
    }

    public AdminPageResponse<BindingRelations> pageBindings(AdminPageQueryDTO queryDTO) {
        LambdaQueryWrapper<BindingRelations> wrapper = new LambdaQueryWrapper<>();
        if (StrUtil.isNotBlank(queryDTO.getStatus())) {
            wrapper.eq(BindingRelations::getStatus, queryDTO.getStatus());
        }
        wrapper.orderByDesc(BindingRelations::getCreatedAt);
        return toPage(bindingRelationsService.page(new Page<>(queryDTO.getPage(), queryDTO.getPageSize()), wrapper));
    }

    public void updateUserStatus(String id, AdminStatusUpdateDTO dto) {
        Users user = getUser(id);
        user.setStatus(dto.getStatus());
        if ("blocked".equals(dto.getStatus())) {
            user.setBlockEndAt(DateUtil.offsetDay(new Date(), 7));
        } else {
            user.setBlockEndAt(null);
        }
        usersService.updateById(user);
    }

    public void adjustUserAssets(String id, AdminAssetAdjustDTO dto) {
        Users user = getUser(id);
        int pointsDelta = ObjectUtil.defaultIfNull(dto.getPointsDelta(), 0);
        int cardsDelta = ObjectUtil.defaultIfNull(dto.getCardsDelta(), 0);
        user.setPoints(ObjectUtil.defaultIfNull(user.getPoints(), 0) + pointsDelta);
        user.setCards(ObjectUtil.defaultIfNull(user.getCards(), 0) + cardsDelta);
        usersService.updateById(user);
    }

    public AdminPageResponse<Tasks> pageTasks(AdminPageQueryDTO queryDTO) {
        LambdaQueryWrapper<Tasks> wrapper = new LambdaQueryWrapper<>();
        if (StrUtil.isNotBlank(queryDTO.getKeyword())) {
            wrapper.and(w -> w.like(Tasks::getTitle, queryDTO.getKeyword())
                    .or().like(Tasks::getDescription, queryDTO.getKeyword()));
        }
        if (StrUtil.isNotBlank(queryDTO.getStatus())) {
            wrapper.eq(Tasks::getStatus, queryDTO.getStatus());
        }
        wrapper.orderByDesc(Tasks::getCreatedAt);
        return toPage(tasksService.page(new Page<>(queryDTO.getPage(), queryDTO.getPageSize()), wrapper));
    }

    public Tasks getTask(String id) {
        Tasks task = tasksService.getById(id);
        if (task == null) {
            throw new AdminBusinessException("任务不存在");
        }
        return task;
    }

    public void updateTaskStatus(String id, AdminStatusUpdateDTO dto) {
        Tasks task = getTask(id);
        task.setStatus(dto.getStatus());
        tasksService.updateById(task);
    }

    public void updateTaskListingStatus(String id, AdminStatusUpdateDTO dto) {
        Tasks task = getTask(id);
        task.setListStatus(dto.getStatus());
        tasksService.updateById(task);
    }

    public AdminPageResponse<TaskComments> pageTaskComments(AdminPageQueryDTO queryDTO) {
        LambdaQueryWrapper<TaskComments> wrapper = new LambdaQueryWrapper<>();
        if (StrUtil.isNotBlank(queryDTO.getKeyword())) {
            wrapper.like(TaskComments::getContent, queryDTO.getKeyword());
        }
        wrapper.orderByDesc(TaskComments::getCreatedAt);
        return toPage(taskCommentsService.page(new Page<>(queryDTO.getPage(), queryDTO.getPageSize()), wrapper));
    }

    public void deleteTaskComment(String id) {
        TaskComments comments = taskCommentsService.getById(id);
        if (comments == null) {
            throw new AdminBusinessException("评论不存在");
        }
        comments.setDeletedAt(new Date());
        taskCommentsService.updateById(comments);
    }

    public void restoreTaskComment(String id) {
        TaskComments comments = taskCommentsService.getById(id);
        if (comments == null) {
            throw new AdminBusinessException("评论不存在");
        }
        comments.setDeletedAt(null);
        taskCommentsService.updateById(comments);
    }

    public AdminPageResponse<TaskTemplates> pageTaskTemplates(AdminPageQueryDTO queryDTO) {
        LambdaQueryWrapper<TaskTemplates> wrapper = new LambdaQueryWrapper<>();
        if (StrUtil.isNotBlank(queryDTO.getStatus())) {
            wrapper.eq(TaskTemplates::getStatus, queryDTO.getStatus());
        }
        wrapper.orderByDesc(TaskTemplates::getCreatedAt);
        return toPage(taskTemplatesService.page(new Page<>(queryDTO.getPage(), queryDTO.getPageSize()), wrapper));
    }

    public void auditTaskTemplate(String id, AdminStatusUpdateDTO dto) {
        TaskTemplates taskTemplates = taskTemplatesService.getById(id);
        if (taskTemplates == null) {
            throw new AdminBusinessException("模板不存在");
        }
        taskTemplates.setStatus(dto.getStatus());
        taskTemplatesService.updateById(taskTemplates);
    }

    public AdminPageResponse<ShopItems> pageShopItems(AdminPageQueryDTO queryDTO) {
        LambdaQueryWrapper<ShopItems> wrapper = new LambdaQueryWrapper<>();
        if (StrUtil.isNotBlank(queryDTO.getKeyword())) {
            wrapper.like(ShopItems::getName, queryDTO.getKeyword());
        }
        if (StrUtil.isNotBlank(queryDTO.getStatus())) {
            wrapper.eq(ShopItems::getStatus, queryDTO.getStatus());
        }
        wrapper.orderByDesc(ShopItems::getCreatedAt);
        return toPage(shopItemsService.page(new Page<>(queryDTO.getPage(), queryDTO.getPageSize()), wrapper));
    }

    public ShopItems createShopItem(ShopItems shopItems) {
        shopItems.setId(UUID.randomUUID().toString());
        shopItems.setCreatedAt(new Date());
        shopItems.setUpdatedAt(new Date());
        shopItemsService.save(shopItems);
        return shopItems;
    }

    public ShopItems updateShopItem(String id, ShopItems payload) {
        ShopItems db = shopItemsService.getById(id);
        if (db == null) {
            throw new AdminBusinessException("商品不存在");
        }
        payload.setId(id);
        payload.setUpdatedAt(new Date());
        payload.setCreatedAt(db.getCreatedAt());
        shopItemsService.updateById(payload);
        return payload;
    }

    public void updateShopItemStatus(String id, AdminStatusUpdateDTO dto) {
        ShopItems db = shopItemsService.getById(id);
        if (db == null) {
            throw new AdminBusinessException("商品不存在");
        }
        db.setStatus(dto.getStatus());
        db.setUpdatedAt(new Date());
        shopItemsService.updateById(db);
    }

    public AdminPageResponse<SpecialItems> pageSpecialItems(AdminPageQueryDTO queryDTO) {
        LambdaQueryWrapper<SpecialItems> wrapper = new LambdaQueryWrapper<>();
        if (StrUtil.isNotBlank(queryDTO.getKeyword())) {
            wrapper.like(SpecialItems::getName, queryDTO.getKeyword());
        }
        if (StrUtil.isNotBlank(queryDTO.getStatus())) {
            wrapper.eq(SpecialItems::getStatus, queryDTO.getStatus());
        }
        wrapper.orderByDesc(SpecialItems::getCreatedAt);
        return toPage(specialItemsService.page(new Page<>(queryDTO.getPage(), queryDTO.getPageSize()), wrapper));
    }

    public SpecialItems createSpecialItem(SpecialItems specialItems) {
        specialItems.setId(UUID.randomUUID().toString());
        specialItems.setCreatedAt(new Date());
        specialItems.setUpdatedAt(new Date());
        specialItemsService.save(specialItems);
        return specialItems;
    }

    public SpecialItems updateSpecialItem(String id, SpecialItems payload) {
        SpecialItems db = specialItemsService.getById(id);
        if (db == null) {
            throw new AdminBusinessException("特殊商品不存在");
        }
        payload.setId(id);
        payload.setCreatedAt(db.getCreatedAt());
        payload.setUpdatedAt(new Date());
        specialItemsService.updateById(payload);
        return payload;
    }

    public void updateSpecialItemStatus(String id, AdminStatusUpdateDTO dto) {
        SpecialItems db = specialItemsService.getById(id);
        if (db == null) {
            throw new AdminBusinessException("特殊商品不存在");
        }
        db.setStatus(dto.getStatus());
        db.setUpdatedAt(new Date());
        specialItemsService.updateById(db);
    }

    public AdminPageResponse<UserItems> pageUserItems(AdminPageQueryDTO queryDTO) {
        LambdaQueryWrapper<UserItems> wrapper = new LambdaQueryWrapper<>();
        if (StrUtil.isNotBlank(queryDTO.getKeyword())) {
            wrapper.and(w -> w.like(UserItems::getName, queryDTO.getKeyword())
                    .or().like(UserItems::getCode, queryDTO.getKeyword()));
        }
        if (StrUtil.isNotBlank(queryDTO.getStatus())) {
            wrapper.eq(UserItems::getStatus, queryDTO.getStatus());
        }
        wrapper.orderByDesc(UserItems::getAcquiredAt);
        return toPage(userItemsService.page(new Page<>(queryDTO.getPage(), queryDTO.getPageSize()), wrapper));
    }

    public void verifyUserItem(String code, String remark) {
        LambdaQueryWrapper<UserItems> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserItems::getCode, code).last("limit 1");
        UserItems userItem = userItemsService.getOne(wrapper);
        if (userItem == null) {
            throw new AdminBusinessException("道具不存在");
        }
        if ("used".equals(userItem.getStatus())) {
            throw new AdminBusinessException("该道具已核销");
        }
        userItem.setStatus("used");
        userItem.setUsedAt(new Date());
        userItemsService.updateById(userItem);

        ItemRedemptionRecords record = new ItemRedemptionRecords();
        record.setId(UUID.randomUUID().toString());
        record.setItemType("normal_item");
        record.setInstanceId(userItem.getId());
        record.setOwnerId(userItem.getUserId());
        record.setRedeemerId(userItem.getUserId());
        record.setCode(code);
        record.setRemark(remark);
        record.setCreatedAt(new Date());
        itemRedemptionRecordsService.save(record);
    }

    public AdminPageResponse<ItemRedemptionRecords> pageRedemptionRecords(AdminPageQueryDTO queryDTO) {
        LambdaQueryWrapper<ItemRedemptionRecords> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByDesc(ItemRedemptionRecords::getCreatedAt);
        return toPage(itemRedemptionRecordsService.page(new Page<>(queryDTO.getPage(), queryDTO.getPageSize()), wrapper));
    }

    public AdminPageResponse<RewardCodes> pageRewardCodes(AdminPageQueryDTO queryDTO) {
        LambdaQueryWrapper<RewardCodes> wrapper = new LambdaQueryWrapper<>();
        if (StrUtil.isNotBlank(queryDTO.getStatus())) {
            wrapper.eq(RewardCodes::getStatus, queryDTO.getStatus());
        }
        if (StrUtil.isNotBlank(queryDTO.getKeyword())) {
            wrapper.like(RewardCodes::getCode, queryDTO.getKeyword());
        }
        wrapper.orderByDesc(RewardCodes::getCreatedAt);
        return toPage(rewardCodesService.page(new Page<>(queryDTO.getPage(), queryDTO.getPageSize()), wrapper));
    }

    public void batchGenerateRewardCodes(AdminRewardCodeBatchGenerateDTO dto, String adminId) {
        if (dto.getCount() == null || dto.getCount() <= 0) {
            throw new AdminBusinessException("count 必须大于 0");
        }
        List<RewardCodes> rewardCodesList = new ArrayList<>();
        for (int i = 0; i < dto.getCount(); i++) {
            RewardCodes rewardCode = new RewardCodes();
            rewardCode.setId(UUID.randomUUID().toString());
            rewardCode.setCode(UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase());
            rewardCode.setRewardType(dto.getRewardType());
            rewardCode.setRewardName(dto.getRewardName());
            rewardCode.setRewardCount(ObjectUtil.defaultIfNull(dto.getRewardCount(), 1));
            rewardCode.setCreatorId(adminId);
            rewardCode.setStatus("unused");
            rewardCode.setDescription(dto.getDescription());
            rewardCode.setCreatedAt(new Date());
            rewardCodesList.add(rewardCode);
        }
        rewardCodesService.saveBatch(rewardCodesList);
    }

    public void voidRewardCode(String id) {
        RewardCodes rewardCodes = rewardCodesService.getById(id);
        if (rewardCodes == null) {
            throw new AdminBusinessException("兑换码不存在");
        }
        rewardCodes.setStatus("voided");
        rewardCodesService.updateById(rewardCodes);
    }

    public void restoreRewardCode(String id) {
        RewardCodes rewardCodes = rewardCodesService.getById(id);
        if (rewardCodes == null) {
            throw new AdminBusinessException("兑换码不存在");
        }
        if ("used".equals(rewardCodes.getStatus())) {
            throw new AdminBusinessException("已使用兑换码不可恢复");
        }
        rewardCodes.setStatus("unused");
        rewardCodesService.updateById(rewardCodes);
    }

    public AdminPageResponse<PointTransactions> pagePointTransactions(AdminPageQueryDTO queryDTO) {
        LambdaQueryWrapper<PointTransactions> wrapper = new LambdaQueryWrapper<>();
        if (StrUtil.isNotBlank(queryDTO.getKeyword())) {
            wrapper.and(w -> w.eq(PointTransactions::getUserId, queryDTO.getKeyword())
                    .or().eq(PointTransactions::getReferenceId, queryDTO.getKeyword()));
        }
        wrapper.orderByDesc(PointTransactions::getCreatedAt);
        return toPage(pointTransactionsService.page(new Page<>(queryDTO.getPage(), queryDTO.getPageSize()), wrapper));
    }

    public AdminPageResponse<CardTransactions> pageCardTransactions(AdminPageQueryDTO queryDTO) {
        LambdaQueryWrapper<CardTransactions> wrapper = new LambdaQueryWrapper<>();
        if (StrUtil.isNotBlank(queryDTO.getKeyword())) {
            wrapper.and(w -> w.eq(CardTransactions::getUserId, queryDTO.getKeyword())
                    .or().eq(CardTransactions::getReferenceId, queryDTO.getKeyword()));
        }
        wrapper.orderByDesc(CardTransactions::getCreatedAt);
        return toPage(cardTransactionsService.page(new Page<>(queryDTO.getPage(), queryDTO.getPageSize()), wrapper));
    }

    public AdminPageResponse<ItemTransactions> pageItemTransactions(AdminPageQueryDTO queryDTO) {
        LambdaQueryWrapper<ItemTransactions> wrapper = new LambdaQueryWrapper<>();
        if (StrUtil.isNotBlank(queryDTO.getKeyword())) {
            wrapper.and(w -> w.eq(ItemTransactions::getUserId, queryDTO.getKeyword())
                    .or().eq(ItemTransactions::getReferenceId, queryDTO.getKeyword()));
        }
        wrapper.orderByDesc(ItemTransactions::getCreatedAt);
        return toPage(itemTransactionsService.page(new Page<>(queryDTO.getPage(), queryDTO.getPageSize()), wrapper));
    }

    private LambdaQueryWrapper<Users> buildUsersQuery(AdminPageQueryDTO queryDTO) {
        LambdaQueryWrapper<Users> wrapper = new LambdaQueryWrapper<>();
        if (StrUtil.isNotBlank(queryDTO.getKeyword())) {
            wrapper.and(w -> w.like(Users::getUsername, queryDTO.getKeyword())
                    .or().like(Users::getNickname, queryDTO.getKeyword())
                    .or().like(Users::getPhone, queryDTO.getKeyword())
                    .or().like(Users::getEmail, queryDTO.getKeyword()));
        }
        if (StrUtil.isNotBlank(queryDTO.getStatus())) {
            wrapper.eq(Users::getStatus, queryDTO.getStatus());
        }
        wrapper.orderByDesc(Users::getCreatedAt);
        return wrapper;
    }

    private <T> AdminPageResponse<T> toPage(Page<T> page) {
        return AdminPageResponse.<T>builder()
                .list(page.getRecords())
                .page(page.getCurrent())
                .pageSize(page.getSize())
                .total(page.getTotal())
                .totalPages(page.getPages())
                .build();
    }
}
