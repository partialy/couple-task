package cn.example.dataserver.services;

import cn.example.dataserver.common.Result;
import cn.example.dataserver.dto.RewardCodePublishDTO;
import cn.example.dataserver.dto.RewardCodeQueryDTO;
import cn.example.dataserver.entity.RewardCodes;
import cn.example.dataserver.entity.Users;
import cn.example.dataserver.enums.ItemStatus;
import cn.example.dataserver.service.RewardCodesService;
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
 * 兑换码业务实现
 */
@Service
@RequiredArgsConstructor
public class RewardCodesServiceImplements {

    private final AuthService authService;
    private final RewardCodesService rewardCodesService;

    /**
     * 发布兑换码并落库
     *
     * @param token 用户令牌
     * @param dto   发布参数
     * @return JSON
     */
    @Transactional(rollbackFor = Exception.class)
    public String publish(String token, RewardCodePublishDTO dto) {
        Users user = authService.checkToken(token);
        if (StrUtil.isBlank(dto.getRewardName())) {
            return Result.fail("奖励名称不能为空").toJson();
        }
        if (StrUtil.isBlank(dto.getRewardType())) {
            return Result.fail("奖励类型不能为空").toJson();
        }
        int count = dto.getRewardCount() != null && dto.getRewardCount() > 0 ? dto.getRewardCount() : 1;

        String code;
        int attempts = 0;
        do {
            code = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
            attempts++;
            if (attempts > 30) {
                return Result.fail("生成兑换码失败，请重试").toJson();
            }
        } while (rewardCodesService.lambdaQuery().eq(RewardCodes::getCode, code).count() > 0);

        RewardCodes rc = new RewardCodes();
        rc.setId(UUID.randomUUID().toString());
        rc.setCode(code);
        rc.setRewardType(dto.getRewardType());
        rc.setRewardName(dto.getRewardName());
        rc.setRewardCount(count);
        rc.setIcon(dto.getIcon());
        rc.setColor(dto.getColor());
        rc.setImageUrl(dto.getImageUrl());
        rc.setDescription(StrUtil.isBlank(dto.getDescription()) ? null : dto.getDescription());
        rc.setCreatorId(user.getId());
        rc.setStatus(ItemStatus.UNUSED.getValue());
        rc.setCreatedAt(new Date());
        rewardCodesService.save(rc);

        return Result.success(rc).toJson();
    }

    /**
     * 分页查询当前用户创建的兑换码
     *
     * @param token 用户令牌
     * @param query 查询条件
     * @return JSON
     */
    public String pageList(String token, RewardCodeQueryDTO query) {
        Users user = authService.checkToken(token);
        long pageNo = query.getPage() == null || query.getPage() < 1 ? 1L : query.getPage();
        long pageSize = query.getSize() == null || query.getSize() < 1 ? 10L : Math.min(query.getSize(), 50L);

        Page<RewardCodes> page = rewardCodesService.lambdaQuery()
                .eq(RewardCodes::getCreatorId, user.getId())
                .eq(StrUtil.isNotBlank(query.getRewardType()), RewardCodes::getRewardType, query.getRewardType())
                .eq(StrUtil.isNotBlank(query.getStatus()), RewardCodes::getStatus, query.getStatus())
                .orderByDesc(RewardCodes::getCreatedAt)
                .page(new Page<>(pageNo, pageSize));

        Map<String, Object> pageData = new HashMap<>(4);
        pageData.put("current", page.getCurrent());
        pageData.put("size", page.getSize());
        pageData.put("total", page.getTotal());
        pageData.put("records", page.getRecords());
        return Result.success(pageData).toJson();
    }

    /**
     * 作废未使用的兑换码
     *
     * @param token 用户令牌
     * @param id    兑换码主键
     * @return JSON
     */
    @Transactional(rollbackFor = Exception.class)
    public String voidCode(String token, String id) {
        Users user = authService.checkToken(token);
        RewardCodes rc = rewardCodesService.getById(id);
        if (rc == null) {
            return Result.fail("兑换码不存在").toJson();
        }
        if (!user.getId().equals(rc.getCreatorId())) {
            return Result.fail("无权操作").toJson();
        }
        if (!ItemStatus.UNUSED.getValue().equals(rc.getStatus())) {
            return Result.fail("仅未兑换时可作废").toJson();
        }
        rc.setStatus("voided");
        rewardCodesService.updateById(rc);
        return Result.success("已作废").toJson();
    }

    /**
     * 将已作废的兑换码恢复为未使用
     *
     * @param token 用户令牌
     * @param id    兑换码主键
     * @return JSON
     */
    @Transactional(rollbackFor = Exception.class)
    public String restoreCode(String token, String id) {
        Users user = authService.checkToken(token);
        RewardCodes rc = rewardCodesService.getById(id);
        if (rc == null) {
            return Result.fail("兑换码不存在").toJson();
        }
        if (!user.getId().equals(rc.getCreatorId())) {
            return Result.fail("无权操作").toJson();
        }
        if (!"voided".equals(rc.getStatus())) {
            return Result.fail("仅已作废时可恢复").toJson();
        }
        rc.setStatus(ItemStatus.UNUSED.getValue());
        rewardCodesService.updateById(rc);
        return Result.success("已恢复").toJson();
    }
}
