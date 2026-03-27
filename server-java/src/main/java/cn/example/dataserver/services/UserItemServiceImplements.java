package cn.example.dataserver.services;

import cn.example.dataserver.common.Result;
import cn.example.dataserver.dto.UserItemQueryDTO;
import cn.example.dataserver.entity.BindingRelations;
import cn.example.dataserver.entity.ItemRedemptionRecords;
import cn.example.dataserver.entity.UserItems;
import cn.example.dataserver.entity.Users;
import cn.example.dataserver.enums.BindingRelation;
import cn.example.dataserver.enums.ItemStatus;
import cn.example.dataserver.service.BindingRelationsService;
import cn.example.dataserver.service.ItemRedemptionRecordsService;
import cn.example.dataserver.service.UserItemsService;
import cn.example.dataserver.vo.UserItemVO;
import cn.hutool.core.util.ObjectUtil;
import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 我的道具业务实现
 */
@Service
@RequiredArgsConstructor
public class UserItemServiceImplements {

    private static final String ITEM_TYPE_NORMAL = "normal_item";
    private static final String ITEM_TYPE_SPECIAL = "special_item";

    private final AuthService authService;
    private final UserItemsService userItemsService;
    private final BindingRelationsService bindingRelationsService;
    private final ItemRedemptionRecordsService itemRedemptionRecordsService;

    /**
     * 解析当前用户已接受的绑定关系
     */
    private BindingRelations resolveAcceptedBinding(String userId) {
        return bindingRelationsService.lambdaQuery()
                .and(wrapper -> wrapper.eq(BindingRelations::getUserId, userId)
                        .or().eq(BindingRelations::getTargetId, userId))
                .eq(BindingRelations::getStatus, BindingRelation.ACCEPTED.getValue())
                .one();
    }

    /**
     * 绑定中对方 userId
     */
    private String partnerUserId(BindingRelations bind, String currentUserId) {
        if (bind == null) {
            return null;
        }
        return currentUserId.equals(bind.getUserId()) ? bind.getTargetId() : bind.getUserId();
    }

    /**
     * 分页查询我的道具
     *
     * @param token 用户令牌
     * @param query 查询参数
     * @return 分页结果
     */
    public String listMyItems(String token, UserItemQueryDTO query) {
        Users currentUser = authService.checkToken(token);

        long pageNo = query.getPage() == null || query.getPage() < 1 ? 1L : query.getPage();
        long pageSize = query.getSize() == null || query.getSize() < 1 ? 10L : Math.min(query.getSize(), 50L);
        String keyword = StrUtil.trimToEmpty(query.getKeyword());

        Page<UserItems> page = userItemsService.lambdaQuery()
                .eq(UserItems::getUserId, currentUser.getId())
                .eq(StrUtil.isNotBlank(query.getStatus()), UserItems::getStatus, query.getStatus())
                .eq(query.getIsSpecial() != null, UserItems::getIsSpecial, query.getIsSpecial())
                .and(StrUtil.isNotBlank(keyword), wrapper -> wrapper.like(UserItems::getCode, keyword)
                        .or()
                        .like(UserItems::getName, keyword)
                        .or()
                        .like(UserItems::getDescription, keyword))
                .orderByDesc(UserItems::getAcquiredAt)
                .page(new Page<>(pageNo, pageSize));

        List<UserItemVO> records = page.getRecords().stream().map(userItem -> {
            UserItemVO vo = new UserItemVO();
            vo.setId(userItem.getId());
            vo.setItemId(userItem.getItemId());
            vo.setStatus(userItem.getStatus());
            vo.setCode(userItem.getCode());
            vo.setAcquiredAt(userItem.getAcquiredAt());
            vo.setUsedAt(userItem.getUsedAt());
            vo.setName(StrUtil.blankToDefault(userItem.getName(), "未知道具"));
            vo.setDescription(StrUtil.blankToDefault(userItem.getDescription(), ""));
            vo.setIcon(StrUtil.blankToDefault(userItem.getIcon(), "Package"));
            vo.setColor(StrUtil.blankToDefault(userItem.getColor(), "slate"));
            vo.setType(StrUtil.blankToDefault(userItem.getType(), "other"));
            vo.setIsSpecial(userItem.getIsSpecial() != null ? userItem.getIsSpecial() : 0);
            return vo;
        }).collect(Collectors.toList());

        Map<String, Object> pageData = Map.of(
                "current", page.getCurrent(),
                "size", page.getSize(),
                "total", page.getTotal(),
                "records", records
        );
        return Result.success(pageData).toJson();
    }

    /**
     * 核销前获取道具信息
     * @param code 核销码
     * @return 道具信息
     */
    public String getItemInfo(String code) {
        UserItems userItem = userItemsService.lambdaQuery()
                .eq(UserItems::getCode, code)
                .eq(UserItems::getStatus, ItemStatus.USABLE.getValue())
                .one();
        if (userItem == null) {
            return Result.fail("核销码无效或已使用").toJson();
        }
        return Result.success(userItem).toJson();
    }


    /**
     * 绑定对象输入核销码，将对方背包中可用道具置为已使用并记录流水
     */
    @Transactional(rollbackFor = Exception.class)
    public String verifyByCode(String token, String rawCode) {
        Users redeemer = authService.checkToken(token);
        BindingRelations bind = resolveAcceptedBinding(redeemer.getId());
        if (ObjectUtil.isNull(bind)) {
            return Result.fail("请先绑定另一半").toJson();
        }
        String partnerId = partnerUserId(bind, redeemer.getId());
        if (StrUtil.isBlank(partnerId)) {
            return Result.fail("无法解析绑定对象").toJson();
        }

        String code = StrUtil.trimToEmpty(rawCode).toUpperCase();
        if (StrUtil.isBlank(code)) {
            return Result.fail("请输入核销码").toJson();
        }

        UserItems userItem = userItemsService.lambdaQuery()
                .eq(UserItems::getCode, code)
                .eq(UserItems::getStatus, ItemStatus.USABLE.getValue())
                .one();
        if (userItem == null) {
            return Result.fail("核销码无效或已使用").toJson();
        }
        if (!partnerId.equals(userItem.getUserId())) {
            return Result.fail("只能核销绑定对象的道具").toJson();
        }

        userItem.setStatus(ItemStatus.USED.getValue());
        userItem.setUsedAt(new Date());
        userItemsService.updateById(userItem);

        ItemRedemptionRecords record = new ItemRedemptionRecords();
        record.setId(UUID.randomUUID().toString());
        record.setItemType(
                userItem.getIsSpecial() != null && userItem.getIsSpecial() == 1
                        ? ITEM_TYPE_SPECIAL
                        : ITEM_TYPE_NORMAL);
        record.setInstanceId(userItem.getId());
        record.setOwnerId(userItem.getUserId());
        record.setRedeemerId(redeemer.getId());
        record.setCode(code);
        record.setRemark(null);
        record.setCreatedAt(new Date());
        itemRedemptionRecordsService.save(record);

        return Result.success("核销成功").toJson();
    }
}
