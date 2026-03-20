package cn.example.dataserver.controller;

import cn.example.dataserver.dto.RewardCodePublishDTO;
import cn.example.dataserver.dto.RewardCodeQueryDTO;
import cn.example.dataserver.services.RewardCodesServiceImplements;
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
}
