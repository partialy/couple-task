package cn.example.dataserver.controller;

import cn.example.dataserver.common.Result;
import cn.example.dataserver.dto.TaskDTO;
import cn.example.dataserver.services.TaskServiceImplements;
import cn.example.dataserver.vo.TaskVO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 任务控制器
 */
@CrossOrigin
@RestController
@RequestMapping("/task")
@RequiredArgsConstructor
public class TaskController {

    private final TaskServiceImplements taskService;

    /**
     * 发布新任务
     * @param token 认证令牌
     * @param taskDTO 任务信息
     * @return JSON 字符串
     */
    @PostMapping("/create")
    public String create(@RequestHeader("Authorization") String token, @RequestBody TaskDTO taskDTO) {
        return taskService.create(token, taskDTO);
    }

    /**
     * 获取任务列表
     * @param token 认证令牌
     * @return JSON 字符串
     */
    @GetMapping("/list")
    public String list(@RequestHeader("Authorization") String token) {
        return taskService.list(token);
    }

    /**
     * 接取任务
     * @param token 认证令牌
     * @param taskId 任务ID
     * @return JSON 字符串
     */
    @PostMapping("/accept/{taskId}")
    public String acceptTask(@RequestHeader("Authorization") String token, @PathVariable String taskId) {
        return taskService.acceptTask(token, taskId);
    }

    /**
     * 放弃任务
     * @param token 认证令牌
     * @param taskId 任务ID
     * @return JSON 字符串
     */
    @PostMapping("/abandon/{taskId}")
    public String abandonTask(@RequestHeader("Authorization") String token, @PathVariable String taskId) {
        return taskService.abandonTask(token, taskId);
    }

    /**
     * 完成任务
     * @param token 认证令牌
     * @param taskId 任务ID
     * @return JSON 字符串
     */
    @PostMapping("/complete/{taskId}")
    public String completeTask(@RequestHeader("Authorization") String token, @PathVariable String taskId) {
        return taskService.completeTask(token, taskId);
    }
}
