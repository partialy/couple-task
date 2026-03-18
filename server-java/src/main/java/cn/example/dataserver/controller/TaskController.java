package cn.example.dataserver.controller;

import cn.example.dataserver.common.Result;
import cn.example.dataserver.dto.TaskDTO;
import cn.example.dataserver.entity.Tasks;
import cn.example.dataserver.entity.TaskRewards;
import cn.example.dataserver.entity.TaskTags;
import cn.example.dataserver.entity.Tags;
import cn.example.dataserver.entity.TaskImages;
import cn.example.dataserver.service.TasksService;
import cn.example.dataserver.service.TaskRewardsService;
import cn.example.dataserver.service.TaskTagsService;
import cn.example.dataserver.service.TagsService;
import cn.example.dataserver.service.TaskImagesService;
import cn.example.dataserver.services.AuthService;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.UUID;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 任务控制器
 */
@CrossOrigin
@RestController
@RequestMapping("/task")
@RequiredArgsConstructor
public class TaskController {

    private final TasksService tasksService;
    private final TaskRewardsService taskRewardsService;
    private final TaskTagsService taskTagsService;
    private final TagsService tagsService;
    private final TaskImagesService taskImagesService;
    private final AuthService authService;

    /**
     * 发布新任务
     * @param token 认证令牌
     * @param taskDTO 任务信息
     * @return 结果
     */
    @PostMapping("/create")
    @Transactional(rollbackFor = Exception.class)
    public Result<String> create(@RequestHeader("Authorization") String token, @RequestBody TaskDTO taskDTO) {
        // 1. 验证用户并获取用户ID
        cn.example.dataserver.entity.Users currentUser = authService.checkToken(token);
        if (currentUser == null) {
            return Result.unauthorized("登录已过期，请重新登录");
        }
        String userId = currentUser.getId();

        // 2. 创建任务实体
        Tasks task = new Tasks();
        String taskId = UUID.randomUUID().toString();
        task.setId(taskId);
        task.setAuthorId(userId);
        task.setTitle(taskDTO.getTitle());
        task.setDescription(taskDTO.getDescription());
        task.setCoverImage(taskDTO.getCoverImage());
        task.setStatus("pending"); // 初始状态为待处理
        task.setIsPrivate(taskDTO.getIsPrivate() ? 1 : 0);
        task.setIsPrivileged(taskDTO.getIsPrivileged() ? 1 : 0);
        task.setRepeatType(taskDTO.getTaskType());
        task.setRepeatConfig(taskDTO.getRepeatConfig());
        task.setCreatedAt(new Date());
        task.setUpdatedAt(new Date());
        
        // 解析截止日期
        if (taskDTO.getDeadline() != null && !taskDTO.getDeadline().isEmpty() && !taskDTO.getDeadline().equals("不限时间")) {
            try {
                // 这里简单处理，实际可能需要更复杂的日期解析
                // task.setDeadline(new SimpleDateFormat("yyyy-MM-dd").parse(taskDTO.getDeadline()));
            } catch (Exception e) {
                // 忽略解析错误
            }
        }

        // 保存主任务
        tasksService.save(task);

        // 3. 保存任务图片
        if (taskDTO.getOtherImages() != null && !taskDTO.getOtherImages().isEmpty()) {
            List<TaskImages> images = taskDTO.getOtherImages().stream().map(url -> {
                TaskImages img = new TaskImages();
                img.setId(UUID.randomUUID().toString());
                img.setTaskId(taskId);
                img.setImageUrl(url);
                return img;
            }).collect(Collectors.toList());
            taskImagesService.saveBatch(images);
        }

        // 4. 保存任务奖励
        if (taskDTO.getRewards() != null && !taskDTO.getRewards().isEmpty()) {
            List<TaskRewards> rewards = taskDTO.getRewards().stream().map(r -> {
                TaskRewards reward = new TaskRewards();
                reward.setId(UUID.randomUUID().toString());
                reward.setTaskId(taskId);
                reward.setType(r.getIsWildcard() ? "wildcard" : "normal");
                reward.setContent(r.getText());
                reward.setIcon(r.getIcon());
                reward.setColor(r.getColor());
                reward.setAmount(r.getAmount());
                return reward;
            }).collect(Collectors.toList());
            taskRewardsService.saveBatch(rewards);
        }

        // 4. 保存任务标签
        if (taskDTO.getTags() != null && !taskDTO.getTags().isEmpty()) {
            for (String tagName : taskDTO.getTags()) {
                // 查找或创建标签
                Tags tag = tagsService.getOne(new LambdaQueryWrapper<Tags>().eq(Tags::getName, tagName));
                if (tag == null) {
                    tag = new Tags();
                    tag.setId(UUID.randomUUID().toString());
                    tag.setName(tagName);
                    tagsService.save(tag);
                }
                
                // 建立关联
                TaskTags taskTag = new TaskTags();
                taskTag.setTaskId(taskId);
                taskTag.setTagId(tag.getId());
                taskTagsService.save(taskTag);
            }
        }

        return Result.success("任务发布成功", taskId);
    }
}
