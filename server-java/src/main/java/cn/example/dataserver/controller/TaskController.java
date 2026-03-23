package cn.example.dataserver.controller;

import cn.example.dataserver.dto.TaskDTO;
import cn.example.dataserver.services.TaskServiceImplements;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

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
     * 更新任务（仅发布者）
     */
    @PutMapping("/{taskId}")
    public String update(
            @RequestHeader("Authorization") String token,
            @PathVariable String taskId,
            @RequestBody TaskDTO taskDTO) {
        return taskService.update(token, taskId, taskDTO);
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
     * 获取任务详情
     * @param token 认证令牌
     * @param taskId 任务ID
     * @return JSON 字符串
     */
    @GetMapping("/detail/{taskId}")
    public String detail(@RequestHeader("Authorization") String token, @PathVariable String taskId) {
        return taskService.detail(token, taskId);
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

    /**
     * 收藏任务
     */
    @PostMapping("/favorite/{taskId}")
    public String addFavorite(@RequestHeader("Authorization") String token, @PathVariable String taskId) {
        return taskService.addFavorite(token, taskId);
    }

    /**
     * 取消收藏任务
     */
    @DeleteMapping("/favorite/{taskId}")
    public String removeFavorite(@RequestHeader("Authorization") String token, @PathVariable String taskId) {
        return taskService.removeFavorite(token, taskId);
    }

    /**
     * 下架（广场不可见）
     */
    @PostMapping("/{taskId}/unpublish")
    public String unpublish(@RequestHeader("Authorization") String token, @PathVariable String taskId) {
        return taskService.unpublishTask(token, taskId);
    }

    /**
     * 上架（含草稿首次发布）
     */
    @PostMapping("/{taskId}/publish-listing")
    public String publishListing(@RequestHeader("Authorization") String token, @PathVariable String taskId) {
        return taskService.publishListing(token, taskId);
    }

    /**
     * 删除任务（软删除）
     */
    @DeleteMapping("/{taskId}")
    public String deleteTask(@RequestHeader("Authorization") String token, @PathVariable String taskId) {
        return taskService.deleteTask(token, taskId);
    }
}
