package cn.example.dataserver.services;

import cn.example.dataserver.common.Result;
import cn.example.dataserver.dto.ShopItemPublishDTO;
import cn.example.dataserver.entity.BindingRelations;
import cn.example.dataserver.entity.ShopItems;
import cn.example.dataserver.entity.Users;
import cn.example.dataserver.enums.BindingRelation;
import cn.example.dataserver.service.BindingRelationsService;
import cn.example.dataserver.service.ShopItemsService;
import cn.hutool.core.util.StrUtil;
import com.google.zxing.common.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.UUID;

/**
 * 积分商城商品
 */
@Service
@RequiredArgsConstructor
public class ShopItemsServiceImplements {

    private static final String STATUS_ACTIVE = "active";

    private final AuthService authService;
    private final BindingRelationsService bindingRelationsService;
    private final ShopItemsService shopItemsService;

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
     * 积分兑换列表：系统内置 + 本绑定 + 指定给当前用户的
     */
    public String listForRedeem(String token) {
        Users user = authService.checkToken(token);
        BindingRelations bind = resolveAcceptedBinding(user.getId());

        var q = shopItemsService.lambdaQuery()
                .isNull(ShopItems::getDeletedAt)
                .eq(ShopItems::getStatus, STATUS_ACTIVE);
        q.isNull(ShopItems::getBelongBindingId);
        if(bind != null) {
            q.or( w -> w.eq(ShopItems::getBelongBindingId, bind.getId())
                    .eq(ShopItems::getBelongUserId, user.getId()));
        }

        List<ShopItems> list = q.orderByAsc(ShopItems::getSortOrder)
                .orderByDesc(ShopItems::getCreatedAt)
                .list();
        return Result.success(list).toJson();
    }

    /**
     * 给 TA 发布：仅当前用户在本绑定下发布的商品
     */
    public String listForPublish(String token) {
        Users user = authService.checkToken(token);
        BindingRelations bind = resolveAcceptedBinding(user.getId());
        if (bind == null) {
            return Result.fail("请先绑定另一半").toJson();
        }
        List<ShopItems> list = shopItemsService.lambdaQuery()
                .isNull(ShopItems::getDeletedAt)
                .eq(ShopItems::getBelongBindingId, bind.getId())
                .eq(ShopItems::getPublishUserId, user.getId())
                .orderByDesc(ShopItems::getUpdatedAt)
                .list();
        return Result.success(list).toJson();
    }

    @Transactional(rollbackFor = Exception.class)
    public String publish(String token, ShopItemPublishDTO dto) {
        Users user = authService.checkToken(token);
        BindingRelations bind = resolveAcceptedBinding(user.getId());
        if (bind == null) {
            return Result.fail("请先绑定另一半").toJson();
        }
        if (StrUtil.isBlank(dto.getName())) {
            return Result.fail("商品名称不能为空").toJson();
        }
        if (dto.getPointsCost() == null || dto.getPointsCost() < 0) {
            return Result.fail("积分不能为空").toJson();
        }

        String partnerId = partnerUserId(bind, user.getId());
        if (StrUtil.isBlank(partnerId)) {
            return Result.fail("无法解析对方用户").toJson();
        }

        ShopItems item = new ShopItems();
        item.setId(UUID.randomUUID().toString());
        item.setName(dto.getName().trim());
        item.setDescription(StrUtil.isBlank(dto.getDescription()) ? null : dto.getDescription().trim());
        item.setItemType(StrUtil.blankToDefault(dto.getItemType(), "prop"));
        item.setPointsCost(dto.getPointsCost());
        item.setIcon(StrUtil.blankToDefault(dto.getIcon(), "gift"));
        item.setColor(StrUtil.blankToDefault(dto.getColor(), "pink"));
        item.setStatus(StrUtil.blankToDefault(dto.getStatus(), STATUS_ACTIVE));
        int stock = dto.getStock() != null ? dto.getStock() : -1;
        item.setStock(stock);
        item.setVersion(0);
        Date now = new Date();
        item.setCreatedAt(now);
        item.setUpdatedAt(now);
        item.setDeletedAt(null);
        item.setBelongBindingId(bind.getId());
        item.setBelongUserId(partnerId);
        item.setPublishUserId(user.getId());
        item.setSortOrder(0);

        shopItemsService.save(item);
        return Result.success(item).toJson();
    }

    @Transactional(rollbackFor = Exception.class)
    public String update(String token, String id, ShopItemPublishDTO dto) {
        Users user = authService.checkToken(token);
        BindingRelations bind = resolveAcceptedBinding(user.getId());
        if (bind == null) {
            return Result.fail("请先绑定另一半").toJson();
        }

        ShopItems item = shopItemsService.getById(id);
        if (item == null || item.getDeletedAt() != null) {
            return Result.fail("商品不存在").toJson();
        }
        if (!bind.getId().equals(item.getBelongBindingId()) || !user.getId().equals(item.getPublishUserId())) {
            return Result.fail("无权编辑该商品").toJson();
        }

        if (StrUtil.isNotBlank(dto.getName())) {
            item.setName(dto.getName().trim());
        }
        if (dto.getDescription() != null) {
            item.setDescription(StrUtil.isBlank(dto.getDescription()) ? null : dto.getDescription().trim());
        }
        if (dto.getItemType() != null) {
            item.setItemType(dto.getItemType());
        }
        if (dto.getPointsCost() != null) {
            item.setPointsCost(dto.getPointsCost());
        }
        if (dto.getIcon() != null) {
            item.setIcon(dto.getIcon());
        }
        if (dto.getColor() != null) {
            item.setColor(dto.getColor());
        }
        if (dto.getStock() != null) {
            item.setStock(dto.getStock());
        }
        if (dto.getStatus() != null) {
            item.setStatus(dto.getStatus());
        }
        item.setUpdatedAt(new Date());
        if (item.getVersion() != null) {
            item.setVersion(item.getVersion() + 1);
        }
        shopItemsService.updateById(item);
        return Result.success(item).toJson();
    }

    @Transactional(rollbackFor = Exception.class)
    public String delete(String token, String id) {
        Users user = authService.checkToken(token);
        BindingRelations bind = resolveAcceptedBinding(user.getId());
        if (bind == null) {
            return Result.fail("请先绑定另一半").toJson();
        }
        ShopItems item = shopItemsService.getById(id);
        if (item == null || item.getDeletedAt() != null) {
            return Result.fail("商品不存在").toJson();
        }
        if (!bind.getId().equals(item.getBelongBindingId()) || !user.getId().equals(item.getPublishUserId())) {
            return Result.fail("无权删除").toJson();
        }
        item.setDeletedAt(new Date());
        item.setUpdatedAt(new Date());
        shopItemsService.updateById(item);
        return Result.success().toJson();
    }

    /**
     * 是否允许当前用户兑换该商品（与 listForRedeem 规则一致）
     */
    public boolean canRedeem(Users user, ShopItems item) {
        if (item == null || item.getDeletedAt() != null) {
            return false;
        }
        if (!STATUS_ACTIVE.equals(item.getStatus())) {
            return false;
        }
        BindingRelations bind = resolveAcceptedBinding(user.getId());
        String bid = item.getBelongBindingId();
        if (StrUtil.isBlank(bid)) {
            return true;
        }
        if (user.getId().equals(item.getBelongUserId())) {
            return true;
        }
        if (bind != null && bid.equals(bind.getId())) {
            return true;
        }
        return false;
    }
}
