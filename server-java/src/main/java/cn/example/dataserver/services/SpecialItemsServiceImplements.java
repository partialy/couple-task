package cn.example.dataserver.services;

import cn.example.dataserver.common.Result;
import cn.example.dataserver.dto.SpecialItemPublishDTO;
import cn.example.dataserver.dto.SpecialItemQueryDTO;
import cn.example.dataserver.entity.BindingRelations;
import cn.example.dataserver.entity.CardTransactions;
import cn.example.dataserver.entity.SpecialItems;
import cn.example.dataserver.entity.Users;
import cn.example.dataserver.enums.BindingRelation;
import cn.example.dataserver.enums.ItemStatus;
import cn.example.dataserver.service.BindingRelationsService;
import cn.example.dataserver.service.CardTransactionsService;
import cn.example.dataserver.service.SpecialItemsService;
import cn.example.dataserver.service.UserItemsService;
import cn.example.dataserver.service.UsersService;
import cn.hutool.core.util.ObjectUtil;
import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * 特别奖励业务实现
 */
@Service
@RequiredArgsConstructor
public class SpecialItemsServiceImplements {

    private static final String STATUS_ACTIVE = "active";
    private static final String STATUS_INACTIVE = "inactive";

    private final AuthService authService;
    private final BindingRelationsService bindingRelationsService;
    private final SpecialItemsService specialItemsService;
    private final UsersService usersService;
    private final CardTransactionsService cardTransactionsService;
    private final UserItemsService userItemsService;

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
     * 分页查询当前绑定下的特别奖励（未逻辑删除）
     * 区分自己和对方
     */
    public String pageList(String token, SpecialItemQueryDTO query) {
        Users user = authService.checkToken(token);
        BindingRelations bind = resolveAcceptedBinding(user.getId());
        if (ObjectUtil.isNull(bind)) {
            return Result.fail("请先绑定另一半").toJson();
        }

        long pageNo = query.getPage() == null || query.getPage() < 1 ? 1L : query.getPage();
        long pageSize = query.getSize() == null || query.getSize() < 1 ? 10L : Math.min(query.getSize(), 100L);

        String listType = StrUtil.blankToDefault(query.getType(), "self");
        if (!"self".equals(listType) && !"target".equals(listType)) {
            return Result.fail("type 参数无效，应为 self 或 target").toJson();
        }

        var wrapper = specialItemsService.lambdaQuery()
                .eq(SpecialItems::getBelongBindingId, bind.getId())
                .isNull(SpecialItems::getDeletedAt)
                .eq(StrUtil.isNotBlank(query.getStatus()), SpecialItems::getStatus, query.getStatus());
        if ("self".equals(listType)) {
            wrapper.eq(SpecialItems::getPublishUserId, user.getId());
        } else {
            wrapper.ne(SpecialItems::getPublishUserId, user.getId());
        }

        Page<SpecialItems> page = wrapper
                .orderByDesc(SpecialItems::getCreatedAt)
                .page(new Page<>(pageNo, pageSize));

        Map<String, Object> pageData = new HashMap<>(4);
        pageData.put("current", page.getCurrent());
        pageData.put("size", page.getSize());
        pageData.put("total", page.getTotal());
        pageData.put("records", page.getRecords());
        return Result.success(pageData).toJson();
    }

    /**
     * 发布特别奖励
     */
    @Transactional(rollbackFor = Exception.class)
    public String publish(String token, SpecialItemPublishDTO dto) {
        Users user = authService.checkToken(token);
        BindingRelations bind = resolveAcceptedBinding(user.getId());
        if (ObjectUtil.isNull(bind)) {
            return Result.fail("请先绑定另一半").toJson();
        }
        if (StrUtil.isBlank(dto.getName())) {
            return Result.fail("奖励名称不能为空").toJson();
        }
        if (dto.getCardsCost() == null || dto.getCardsCost() < 1) {
            return Result.fail("万能卡数量至少为 1").toJson();
        }

        int stock = dto.getStock() != null ? dto.getStock() : -1;

        SpecialItems item = new SpecialItems();
        item.setId(UUID.randomUUID().toString());
        item.setName(dto.getName().trim());
        item.setDescription(StrUtil.isBlank(dto.getDescription()) ? null : dto.getDescription().trim());
        item.setCardsCost(dto.getCardsCost());
        item.setIcon(StrUtil.isBlank(dto.getIcon()) ? "crown" : dto.getIcon().trim());
        item.setColor(StrUtil.isBlank(dto.getColor()) ? "indigo" : dto.getColor().trim());
        item.setImageUrl(StrUtil.isBlank(dto.getImageUrl()) ? null : dto.getImageUrl().trim());
        item.setStatus(STATUS_ACTIVE);
        item.setStock(stock);
        item.setVersion(1);
        item.setBelongBindingId(bind.getId());
        item.setPublishUserId(user.getId());
        Date now = new Date();
        item.setCreatedAt(now);
        item.setUpdatedAt(now);
        item.setDeletedAt(null);

        specialItemsService.save(item);
        return Result.success(item).toJson();
    }

    /**
     * 更新特别奖励（仅发布者可改）
     */
    @Transactional(rollbackFor = Exception.class)
    public String update(String token, String id, SpecialItemPublishDTO dto) {
        Users user = authService.checkToken(token);
        BindingRelations bind = resolveAcceptedBinding(user.getId());
        if (ObjectUtil.isNull(bind)) {
            return Result.fail("请先绑定另一半").toJson();
        }

        SpecialItems item = specialItemsService.getById(id);
        if (item == null || item.getDeletedAt() != null) {
            return Result.fail("特别奖励不存在").toJson();
        }
        if (!bind.getId().equals(item.getBelongBindingId())) {
            return Result.fail("无权操作").toJson();
        }
        if (!user.getId().equals(item.getPublishUserId())) {
            return Result.fail("仅发布者可修改").toJson();
        }

        if (StrUtil.isNotBlank(dto.getName())) {
            item.setName(dto.getName().trim());
        }
        if (dto.getDescription() != null) {
            item.setDescription(StrUtil.isBlank(dto.getDescription()) ? null : dto.getDescription().trim());
        }
        if (dto.getCardsCost() != null) {
            if (dto.getCardsCost() < 1) {
                return Result.fail("万能卡数量至少为 1").toJson();
            }
            item.setCardsCost(dto.getCardsCost());
        }
        if (StrUtil.isNotBlank(dto.getIcon())) {
            item.setIcon(dto.getIcon().trim());
        }
        if (StrUtil.isNotBlank(dto.getColor())) {
            item.setColor(dto.getColor().trim());
        }
        if (dto.getImageUrl() != null) {
            item.setImageUrl(StrUtil.isBlank(dto.getImageUrl()) ? null : dto.getImageUrl().trim());
        }
        if (dto.getStock() != null) {
            item.setStock(dto.getStock());
        }

        item.setUpdatedAt(new Date());
        if (item.getVersion() != null) {
            item.setVersion(item.getVersion() + 1);
        }

        specialItemsService.updateById(item);
        return Result.success(item).toJson();
    }

    /**
     * 逻辑删除
     */
    @Transactional(rollbackFor = Exception.class)
    public String delete(String token, String id) {
        Users user = authService.checkToken(token);
        BindingRelations bind = resolveAcceptedBinding(user.getId());
        if (ObjectUtil.isNull(bind)) {
            return Result.fail("请先绑定另一半").toJson();
        }

        SpecialItems item = specialItemsService.getById(id);
        if (item == null || item.getDeletedAt() != null) {
            return Result.fail("特别奖励不存在").toJson();
        }
        if (!bind.getId().equals(item.getBelongBindingId())) {
            return Result.fail("无权操作").toJson();
        }
        if (!user.getId().equals(item.getPublishUserId())) {
            return Result.fail("仅发布者可删除").toJson();
        }

        item.setDeletedAt(new Date());
        item.setUpdatedAt(new Date());
        specialItemsService.updateById(item);
        return Result.success().toJson();
    }

    /**
     * 更新上下架状态
     */
    @Transactional(rollbackFor = Exception.class)
    public String updateStatus(String token, String id, String status) {
        Users user = authService.checkToken(token);
        BindingRelations bind = resolveAcceptedBinding(user.getId());
        if (ObjectUtil.isNull(bind)) {
            return Result.fail("请先绑定另一半").toJson();
        }

        if (StrUtil.isBlank(status) || (!STATUS_ACTIVE.equals(status) && !STATUS_INACTIVE.equals(status))) {
            return Result.fail("状态无效").toJson();
        }

        SpecialItems item = specialItemsService.getById(id);
        if (item == null || item.getDeletedAt() != null) {
            return Result.fail("特别奖励不存在").toJson();
        }
        if (!bind.getId().equals(item.getBelongBindingId())) {
            return Result.fail("无权操作").toJson();
        }
        if (!user.getId().equals(item.getPublishUserId())) {
            return Result.fail("仅发布者可操作").toJson();
        }

        item.setStatus(status);
        item.setUpdatedAt(new Date());
        specialItemsService.updateById(item);
        return Result.success(item).toJson();
    }

    /**
     * 使用万能卡兑换对方发布的特别奖励
     */
    @Transactional(rollbackFor = Exception.class)
    public String redeem(String token, String specialItemId) {
        Users current = authService.checkToken(token);
        BindingRelations bind = resolveAcceptedBinding(current.getId());
        if (ObjectUtil.isNull(bind)) {
            return Result.fail("请先绑定另一半").toJson();
        }

        SpecialItems item = specialItemsService.getById(specialItemId);
        if (item == null || item.getDeletedAt() != null) {
            return Result.fail("特别奖励不存在").toJson();
        }
        if (!bind.getId().equals(item.getBelongBindingId())) {
            return Result.fail("无权兑换").toJson();
        }
        if (current.getId().equals(item.getPublishUserId())) {
            return Result.fail("不能兑换自己发布的奖励").toJson();
        }
        if (!STATUS_ACTIVE.equals(item.getStatus())) {
            return Result.fail("该奖励已下架").toJson();
        }

        Integer stock = item.getStock();
        boolean unlimited = stock == null || stock < 0;
        if (!unlimited && stock == 0) {
            return Result.fail("库存不足").toJson();
        }

        Integer cost = item.getCardsCost() != null ? item.getCardsCost() : 0;
        if (cost < 1) {
            return Result.fail("兑换所需万能卡无效").toJson();
        }

        Integer cards = current.getCards() == null ? 0 : current.getCards();
        if (cards < cost) {
            return Result.fail("万能卡不足").toJson();
        }

        current.setCards(cards - cost);
        usersService.updateById(current);

        CardTransactions ct = new CardTransactions();
        ct.setUserId(current.getId());
        ct.setAmount(-cost);
        ct.setTransactionType("special_redeem");
        ct.setReferenceId(item.getId());
        ct.setDescription("兑换特别奖励：" + item.getName());
        ct.setCreatedAt(new Date());
        cardTransactionsService.save(ct);

        if (!unlimited) {
            item.setStock(stock - 1);
            item.setUpdatedAt(new Date());
            if (item.getVersion() != null) {
                item.setVersion(item.getVersion() + 1);
            }
            specialItemsService.updateById(item);
        }

        UserItems ui = new UserItems();
        ui.setId(UUID.randomUUID().toString());
        ui.setUserId(current.getId());
        ui.setItemId(item.getId());
        ui.setStatus(ItemStatus.USABLE.getValue());
        ui.setCode(UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase());
        ui.setAcquiredAt(new Date());
        ui.setName(item.getName());
        ui.setDescription(StrUtil.isBlank(item.getDescription()) ? "" : item.getDescription());
        ui.setIcon(StrUtil.isBlank(item.getIcon()) ? "Package" : item.getIcon());
        ui.setColor(StrUtil.isBlank(item.getColor()) ? "purple" : item.getColor());
        ui.setType("special");
        ui.setIsSpecial(1);
        userItemsService.save(ui);

        Map<String, Object> data = new HashMap<>(8);
        data.put("userItemId", ui.getId());
        data.put("verifyCode", ui.getCode());
        data.put("specialItemId", item.getId());
        return Result.success(data).toJson();
    }
}
