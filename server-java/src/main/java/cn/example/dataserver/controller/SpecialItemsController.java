package cn.example.dataserver.controller;

import cn.example.dataserver.dto.SpecialItemPublishDTO;
import cn.example.dataserver.dto.SpecialItemQueryDTO;
import cn.example.dataserver.dto.SpecialItemStatusDTO;
import cn.example.dataserver.services.SpecialItemsServiceImplements;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 特别奖励接口
 */
@CrossOrigin
@RestController
@RequestMapping("/special-items")
@RequiredArgsConstructor
public class SpecialItemsController {

    private final SpecialItemsServiceImplements specialItemsServiceImplements;

    /**
     * 分页查询当前绑定下的特别奖励
     */
    @GetMapping("/page")
    public String page(
            @RequestHeader("Authorization") String token,
            @RequestParam(defaultValue = "1") Long page,
            @RequestParam(defaultValue = "10") Long size,
            @RequestParam(required = false) String status
    ) {
        SpecialItemQueryDTO query = new SpecialItemQueryDTO();
        query.setPage(page);
        query.setSize(size);
        query.setStatus(status);
        return specialItemsServiceImplements.pageList(token, query);
    }

    /**
     * 发布特别奖励
     */
    @PostMapping("/publish")
    public String publish(@RequestHeader("Authorization") String token, @RequestBody SpecialItemPublishDTO dto) {
        return specialItemsServiceImplements.publish(token, dto);
    }

    /**
     * 更新特别奖励
     */
    @PutMapping("/{id}")
    public String update(
            @RequestHeader("Authorization") String token,
            @PathVariable String id,
            @RequestBody SpecialItemPublishDTO dto
    ) {
        return specialItemsServiceImplements.update(token, id, dto);
    }

    /**
     * 逻辑删除
     */
    @DeleteMapping("/{id}")
    public String delete(@RequestHeader("Authorization") String token, @PathVariable String id) {
        return specialItemsServiceImplements.delete(token, id);
    }

    /**
     * 更新上下架状态
     */
    @PostMapping("/{id}/status")
    public String updateStatus(
            @RequestHeader("Authorization") String token,
            @PathVariable String id,
            @RequestBody SpecialItemStatusDTO body
    ) {
        return specialItemsServiceImplements.updateStatus(token, id, body.getStatus());
    }
}
