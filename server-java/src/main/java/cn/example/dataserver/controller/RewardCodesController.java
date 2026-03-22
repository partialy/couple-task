package cn.example.dataserver.controller;

import cn.example.dataserver.common.Result;
import cn.example.dataserver.dto.RewardCodePublishDTO;
import cn.example.dataserver.dto.RewardCodeQueryDTO;
import cn.example.dataserver.dto.RewardCodeRedeemDTO;
import cn.example.dataserver.services.PointsServiceImplements;
import cn.example.dataserver.services.RewardCodesServiceImplements;
import cn.hutool.core.util.StrUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 兑换码接口
 */
@CrossOrigin
@RestController
@RequestMapping("/reward-codes")
@RequiredArgsConstructor
public class RewardCodesController {

    private final RewardCodesServiceImplements rewardCodesService;
    private final PointsServiceImplements pointsService;

    /**
     * 发布兑换码
     */
    @PostMapping("/publish")
    public String publish(@RequestHeader("Authorization") String token, @RequestBody RewardCodePublishDTO dto) {
        return rewardCodesService.publish(token, dto);
    }

    /**
     * 分页查询我发布的兑换码
     */
    @GetMapping("/page")
    public String page(
            @RequestHeader("Authorization") String token,
            @RequestParam(defaultValue = "1") Long page,
            @RequestParam(defaultValue = "10") Long size,
            @RequestParam(required = false) String rewardType,
            @RequestParam(required = false) String status
    ) {
        RewardCodeQueryDTO query = new RewardCodeQueryDTO();
        query.setPage(page);
        query.setSize(size);
        query.setRewardType(rewardType);
        query.setStatus(status);
        return rewardCodesService.pageList(token, query);
    }

    /**
     * 作废兑换码
     */
    @PostMapping("/void/{id}")
    public String voidCode(@RequestHeader("Authorization") String token, @PathVariable String id) {
        return rewardCodesService.voidCode(token, id);
    }

    /**
     * 恢复已作废的兑换码
     */
    @PostMapping("/restore/{id}")
    public String restore(@RequestHeader("Authorization") String token, @PathVariable String id) {
        return rewardCodesService.restoreCode(token, id);
    }

    /**
     * 使用兑换码领取奖励（委托积分服务，与 POST /points/redeem-code 行为一致）
     */
    @PostMapping("/redeem")
    public String redeem(@RequestHeader("Authorization") String token, @RequestBody(required = false) RewardCodeRedeemDTO dto) {
        if (dto == null || StrUtil.isBlank(dto.getCode())) {
            return Result.fail("兑换码不能为空").toJson();
        }
        return pointsService.redeemCode(token, dto.getCode().trim());
    }
}
