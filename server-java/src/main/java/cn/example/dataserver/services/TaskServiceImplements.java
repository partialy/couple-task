package cn.example.dataserver.services;

import cn.example.dataserver.common.Result;
import cn.example.dataserver.dto.TaskDTO;
import cn.example.dataserver.entity.*;
import cn.example.dataserver.enums.BindingRelation;
import cn.example.dataserver.service.*;
import cn.example.dataserver.vo.TaskVO;
import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.util.ObjectUtil;
import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 任务业务逻辑实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TaskServiceImplements {

    private final TasksService tasksService;
    private final TaskRewardsService taskRewardsService;
    private final TaskTagsService taskTagsService;
    private final TagsService tagsService;
    private final TaskImagesService taskImagesService;
    private final BindingRelationsService bindingRelationsService;
    private final AuthService authService;

    /**
     * 发布新任务
     * @param token 认证令牌
     * @param taskDTO 任务信息
     * @return JSON 字符串
     */
    @Transactional(rollbackFor = Exception.class)
    public String create(String token, TaskDTO taskDTO) {
        // 1. 验证用户并获取用户ID
        Users currentUser = authService.checkToken(token);
        if (ObjectUtil.isNull(currentUser)) {
            return Result.unauthorized("登录已过期，请重新登录").toJson();
        }
        String userId = currentUser.getId();

        // 获取当前用户的绑定关系
        BindingRelations bindRelation = bindingRelationsService.lambdaQuery()
                .and(wrapper -> wrapper.eq(BindingRelations::getUserId, userId)
                        .or().eq(BindingRelations::getTargetId, userId))
                .eq(BindingRelations::getStatus, BindingRelation.ACCEPTED.getValue())
                .one();

        if (ObjectUtil.isNull(bindRelation)) {
            return Result.fail("请先绑定另一半再发布任务").toJson();
        }

        // 2. 创建任务实体
        Tasks task = new Tasks();
        String taskId = UUID.randomUUID().toString();
        task.setId(taskId);
        task.setAuthorId(userId);
        task.setBelongBindingId(bindRelation.getId());
        task.setReceiverId(userId.equals(bindRelation.getUserId()) ? bindRelation.getTargetId() : bindRelation.getUserId());
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
        if (StrUtil.isNotBlank(taskDTO.getDeadline()) && !taskDTO.getDeadline().equals("不限时间")) {
            try {
                // 这里简单处理，实际可能需要更复杂的日期解析
                // task.setDeadline(new SimpleDateFormat("yyyy-MM-dd").parse(taskDTO.getDeadline()));
            } catch (Exception e) {
                log.error("解析截止日期出错：", e);
            }
        }

        // 保存主任务
        tasksService.save(task);

        // 3. 保存任务图片
        if (CollUtil.isNotEmpty(taskDTO.getOtherImages())) {
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
        if (CollUtil.isNotEmpty(taskDTO.getRewards())) {
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
        if (CollUtil.isNotEmpty(taskDTO.getTags())) {
            for (String tagName : taskDTO.getTags()) {
                // 查找或创建标签
                Tags tag = tagsService.getOne(new LambdaQueryWrapper<Tags>().eq(Tags::getName, tagName));
                if (ObjectUtil.isNull(tag)) {
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

        return Result.success("任务发布成功", taskId).toJson();
    }

    /**
     * 获取任务列表
     * @param token 认证令牌
     * @return JSON 字符串
     */
    public String list(String token) {
        // 1. 验证用户
        Users currentUser = authService.checkToken(token);
        if (ObjectUtil.isNull(currentUser)) {
            return Result.unauthorized("登录已过期，请重新登录").toJson();
        }
        String userId = currentUser.getId();

        // 2. 获取当前用户的绑定关系
        BindingRelations bindRelation = bindingRelationsService.lambdaQuery()
                .and(wrapper -> wrapper.eq(BindingRelations::getUserId, userId)
                        .or().eq(BindingRelations::getTargetId, userId))
                .eq(BindingRelations::getStatus, BindingRelation.ACCEPTED.getValue())
                .one();

        if (ObjectUtil.isNull(bindRelation)) {
            return Result.success(List.of()).toJson(); // 未绑定，无任务
        }

        // 3. 获取该绑定的所有任务
        List<Tasks> tasks = tasksService.lambdaQuery()
                .eq(Tasks::getBelongBindingId, bindRelation.getId())
                .orderByDesc(Tasks::getCreatedAt)
                .list();

        // 4. 组装 VO
        List<TaskVO> taskVOs = tasks.stream().map(task -> {
            TaskVO vo = new TaskVO();
            BeanUtils.copyProperties(task, vo);
            
            // 获取奖励
            List<TaskRewards> rewards = taskRewardsService.lambdaQuery()
                    .eq(TaskRewards::getTaskId, task.getId())
                    .list();
            vo.setRewards(rewards);
            
            // 获取标签
            List<TaskTags> taskTags = taskTagsService.lambdaQuery()
                    .eq(TaskTags::getTaskId, task.getId())
                    .list();
            if (CollUtil.isNotEmpty(taskTags)) {
                List<String> tagIds = taskTags.stream().map(TaskTags::getTagId).collect(Collectors.toList());
                List<Tags> tags = tagsService.lambdaQuery().in(Tags::getId, tagIds).list();
                vo.setTags(tags.stream().map(Tags::getName).collect(Collectors.toList()));
            }
            
            // 获取图片
            List<TaskImages> images = taskImagesService.lambdaQuery()
                    .eq(TaskImages::getTaskId, task.getId())
                    .list();
            vo.setImages(images);
            
            return vo;
        }).collect(Collectors.toList());

        return Result.success(taskVOs).toJson();
    }
}
