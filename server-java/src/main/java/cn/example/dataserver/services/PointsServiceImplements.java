package cn.example.dataserver.services;

import cn.example.dataserver.common.Result;
import cn.example.dataserver.entity.*;
import cn.example.dataserver.enums.ItemStatus;
import cn.example.dataserver.enums.RewardType;
import cn.example.dataserver.service.*;
import cn.hutool.core.util.ObjectUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PointsServiceImplements {

    private final AuthService authService;
    private final PointTransactionsService pointTransactionsService;
    private final RewardCodesService rewardCodesService;
    private final ShopItemsService shopItemsService;
    private final UsersService usersService;
    private final UserItemsService userItemsService;
    private final CardTransactionsService cardTransactionsService;
    private final ItemTransactionsService itemTransactionsService;

    public String getHistory(String token) {
        Users currentUser = authService.checkToken(token);
        List<PointTransactions> history = pointTransactionsService.lambdaQuery()
                .eq(PointTransactions::getUserId, currentUser.getId())
                .orderByDesc(PointTransactions::getCreatedAt)
                .list();

        return Result.success(history).toJson();
    }

    @Transactional(rollbackFor = Exception.class)
    public String redeemCode(String token, String code) {
        Users currentUser = authService.checkToken(token);
        RewardCodes rewardCode = rewardCodesService.lambdaQuery()
                .eq(RewardCodes::getCode, code)
                .one();

        if (ObjectUtil.isNull(rewardCode)) {
            return Result.fail("兑换码无效").toJson();
        }

        if (!ItemStatus.UNUSED.getValue().equals(rewardCode.getStatus())) {
            return Result.fail("兑换码已被使用或已作废").toJson();
        }

        // Mark as used
        rewardCode.setStatus(ItemStatus.USED.getValue());
        rewardCode.setRedeemerId(currentUser.getId());
        rewardCode.setRedeemedAt(new Date());
        rewardCodesService.updateById(rewardCode);

        if (RewardType.POINTS.getValue().equals(rewardCode.getRewardType())) {
            Integer pointsToAdd = rewardCode.getRewardCount() != null ? rewardCode.getRewardCount() : 0;
            if (pointsToAdd > 0) {
                Integer currentPoints = currentUser.getPoints() == null ? 0 : currentUser.getPoints();
                currentUser.setPoints(currentPoints + pointsToAdd);
                usersService.updateById(currentUser);

                PointTransactions pt = new PointTransactions();
                pt.setUserId(currentUser.getId());
                pt.setAmount(pointsToAdd);
                pt.setTransactionType("redeem_code");
                pt.setReferenceId(rewardCode.getId());
                pt.setDescription("兑换码奖励：" + rewardCode.getRewardName());
                pt.setCreatedAt(new Date());
                pointTransactionsService.save(pt);
            }
        } else if (RewardType.WILD_CARD.getValue().equals(rewardCode.getRewardType())) {
            Integer count = rewardCode.getRewardCount() != null ? rewardCode.getRewardCount() : 0;
            if (count > 0) {
                Integer cards = currentUser.getCards() == null ? 0 : currentUser.getCards();
                currentUser.setCards(cards + count);
                usersService.updateById(currentUser);

                CardTransactions ct = new CardTransactions();
                ct.setUserId(currentUser.getId());
                ct.setAmount(count);
                ct.setTransactionType("card_reward");
                ct.setReferenceId(rewardCode.getCode());
                ct.setDescription("兑换获得：" + rewardCode.getRewardName());
                ct.setCreatedAt(new Date());
                cardTransactionsService.save(ct);
            }
        } else {
            // 兑换道具
            int count = rewardCode.getRewardCount() != null ? rewardCode.getRewardCount() : 1;
            for (int i = 0; i < count; i++) {
                saveUserItem(
                        currentUser,
                        rewardCode.getCode(),
                        rewardCode.getRewardName(),
                        rewardCode.getDescription(),
                        rewardCode.getIcon(),
                        rewardCode.getRewardType(),
                        rewardCode.getColor(),
                        userItemsService
                );

                ItemTransactions it = new ItemTransactions();
                it.setUserId(currentUser.getId());
                it.setItemId(rewardCode.getCode());
                it.setTransactionType("redeem_code");
                it.setReferenceId(rewardCode.getCode());
                it.setDescription("兑换获得道具：" + rewardCode.getRewardName());
                it.setCreatedAt(new Date());
                itemTransactionsService.save(it);
            }
        }

        return Result.success("兑换成功").toJson();
    }

    @Transactional(rollbackFor = Exception.class)
    public String redeemItem(String token, String itemId) {
        Users currentUser = authService.checkToken(token);
        ShopItems shopItem = shopItemsService.getById(itemId);
        if (ObjectUtil.isNull(shopItem)) {
            return Result.fail("商品不存在").toJson();
        }

        if (!"active".equals(shopItem.getStatus())) {
            return Result.fail("商品已下架").toJson();
        }

        if (shopItem.getStock() != null && shopItem.getStock() == 0) {
            return Result.fail("商品库存不足").toJson();
        }

        Integer cost = shopItem.getPointsCost() != null ? shopItem.getPointsCost() : 0;
        Integer currentPoints = currentUser.getPoints() == null ? 0 : currentUser.getPoints();

        if (currentPoints < cost) {
            return Result.fail("积分不足").toJson();
        }

        // 扣除积分
        currentUser.setPoints(currentPoints - cost);
        usersService.updateById(currentUser);

        // 记录积分变动
        PointTransactions pt = new PointTransactions();
        pt.setUserId(currentUser.getId());
        pt.setAmount(-cost);
        pt.setTransactionType("redeem_item");
        pt.setReferenceId(shopItem.getId());
        pt.setDescription("兑换商品：" + shopItem.getName());
        pt.setCreatedAt(new Date());
        pointTransactionsService.save(pt);

        // 增加道具
        saveUserItem(
                currentUser,
                shopItem.getId(),
                shopItem.getName(),
                shopItem.getDescription(),
                shopItem.getIcon(),
                shopItem.getItemType(),
                shopItem.getColor(),
                userItemsService
        );

        // 库存减一
        if (shopItem.getStock() != null && shopItem.getStock() > 0) {
            shopItem.setStock(shopItem.getStock() - 1);
            shopItemsService.updateById(shopItem);
        }

        return Result.success("兑换成功").toJson();
    }

    static void saveUserItem(
            Users currentUser,
            String itemId,
            String name,
            String description,
            String icon,
            String type,
            String color,
            UserItemsService userItemsService
    ) {
        UserItems item = new UserItems();
        item.setId(UUID.randomUUID().toString());
        item.setUserId(currentUser.getId());
        item.setItemId(itemId);
        item.setStatus(ItemStatus.USABLE.getValue());
        item.setCode(UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        item.setAcquiredAt(new Date());
        item.setName(name);
        item.setDescription(description);
        item.setIcon(icon);
        item.setType(type);
        item.setColor(color);
        item.setIsSpecial(0);
        userItemsService.save(item);
    }
}
