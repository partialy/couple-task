package cn.example.dataserver.controller;

import cn.example.dataserver.dto.TaskCommentCreateDTO;
import cn.example.dataserver.services.TaskCommentServiceImplements;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 任务评论控制器
 */
@CrossOrigin
@RestController
@RequestMapping("/task/comment")
@RequiredArgsConstructor
public class TaskCommentController {
    private final TaskCommentServiceImplements taskCommentService;

    /**
     * 获取任务评论列表
     * @param token 认证令牌
     * @param taskId 任务ID
     * @return JSON 字符串
     */
    @GetMapping("/list")
    public String list(@RequestHeader("Authorization") String token, @RequestParam String taskId) {
        return taskCommentService.list(token, taskId);
    }

    /**
     * 创建任务评论
     * @param token 认证令牌
     * @param createDTO 创建参数
     * @return JSON 字符串
     */
    @PostMapping("/create")
    public String create(@RequestHeader("Authorization") String token, @RequestBody TaskCommentCreateDTO createDTO) {
        return taskCommentService.create(token, createDTO);
    }
}
