package cn.example.dataserver.controller;

import cn.example.dataserver.dto.UserItemQueryDTO;
import cn.example.dataserver.services.UserItemServiceImplements;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 我的道具接口
 */
@CrossOrigin
@RestController
@RequestMapping("/user-items")
@RequiredArgsConstructor
public class UserItemsController {

    private final UserItemServiceImplements userItemService;

    /**
     * 分页查询我的道具
     *
     * @param token 认证令牌
     * @param page 页码
     * @param size 每页条数
     * @param status 状态筛选
     * @param keyword 搜索关键字
     * @return 分页结果
     */
    @GetMapping("/page")
    public String listMyItems(
            @RequestHeader("Authorization") String token,
            @RequestParam(defaultValue = "1") Long page,
            @RequestParam(defaultValue = "10") Long size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer isSpecial
    ) {
        UserItemQueryDTO queryDTO = new UserItemQueryDTO();
        queryDTO.setPage(page);
        queryDTO.setSize(size);
        queryDTO.setStatus(status);
        queryDTO.setKeyword(keyword);
        queryDTO.setIsSpecial(isSpecial);
        return userItemService.listMyItems(token, queryDTO);
    }
}
