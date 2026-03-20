package cn.example.dataserver.services;

import cn.example.dataserver.common.Result;
import cn.example.dataserver.dto.UserItemQueryDTO;
import cn.example.dataserver.entity.UserItems;
import cn.example.dataserver.entity.Users;
import cn.example.dataserver.service.UserItemsService;
import cn.example.dataserver.vo.UserItemVO;
import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 我的道具业务实现
 */
@Service
@RequiredArgsConstructor
public class UserItemServiceImplements {

    private final AuthService authService;
    private final UserItemsService userItemsService;

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
}
