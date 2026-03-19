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
    private final UsersService usersService;
    private final PointTransactionsService pointTransactionsService;
    private final UserItemsService userItemsService;
    private final TaskLogsService taskLogsService;

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

    /**
     * 接取任务
     * @param token 认证令牌
     * @param taskId 任务ID
     * @return JSON 字符串
     */
    @Transactional(rollbackFor = Exception.class)
    public String acceptTask(String token, String taskId) {
        Users currentUser = authService.checkToken(token);
        if (ObjectUtil.isNull(currentUser)) {
            return Result.unauthorized("登录已过期，请重新登录").toJson();
        }

        Tasks task = tasksService.getById(taskId);
        if (ObjectUtil.isNull(task)) {
            return Result.fail("任务不存在").toJson();
        }

        if (!"pending".equals(task.getStatus())) {
            return Result.fail("任务状态不允许接取").toJson();
        }

        // 验证权限：只有接收者可以接取
        if (!currentUser.getId().equals(task.getReceiverId())) {
            return Result.fail("无权接取该任务").toJson();
        }

        // 更新状态
        task.setStatus("in-progress");
        task.setUpdatedAt(new Date());
        tasksService.updateById(task);

        // 记录日志
        TaskLogs log = new TaskLogs();
        log.setTaskId(taskId);
        log.setUserId(currentUser.getId());
        log.setAction("accept");
        log.setPreviousStatus("pending");
        log.setNewStatus("in-progress");
        log.setCreatedAt(new Date());
        taskLogsService.save(log);

        return Result.success("接取成功").toJson();
    }

    /**
     * 放弃任务
     * @param token 认证令牌
     * @param taskId 任务ID
     * @return JSON 字符串
     */
    @Transactional(rollbackFor = Exception.class)
    public String abandonTask(String token, String taskId) {
        Users currentUser = authService.checkToken(token);
        if (ObjectUtil.isNull(currentUser)) {
            return Result.unauthorized("登录已过期，请重新登录").toJson();
        }

        Tasks task = tasksService.getById(taskId);
        if (ObjectUtil.isNull(task)) {
            return Result.fail("任务不存在").toJson();
        }

        if (!"in-progress".equals(task.getStatus())) {
            return Result.fail("任务状态不允许放弃").toJson();
        }

        // 验证权限：只有接收者可以放弃
        if (!currentUser.getId().equals(task.getReceiverId())) {
            return Result.fail("无权放弃该任务").toJson();
        }

        // 更新状态
        task.setStatus("pending");
        task.setUpdatedAt(new Date());
        tasksService.updateById(task);

        // 记录日志
        TaskLogs log = new TaskLogs();
        log.setTaskId(taskId);
        log.setUserId(currentUser.getId());
        log.setAction("abandon");
        log.setPreviousStatus("in-progress");
        log.setNewStatus("pending");
        log.setCreatedAt(new Date());
        taskLogsService.save(log);

        return Result.success("放弃成功").toJson();
    }

    /**
     * 完成任务
     * @param token 认证令牌
     * @param taskId 任务ID
     * @return JSON 字符串
     */
    @Transactional(rollbackFor = Exception.class)
    public String completeTask(String token, String taskId) {
        Users currentUser = authService.checkToken(token);
        if (ObjectUtil.isNull(currentUser)) {
            return Result.unauthorized("登录已过期，请重新登录").toJson();
        }

        Tasks task = tasksService.getById(taskId);
        if (ObjectUtil.isNull(task)) {
            return Result.fail("任务不存在").toJson();
        }

        if (!"in-progress".equals(task.getStatus())) {
            return Result.fail("任务状态不允许完成").toJson();
        }

        // 验证权限：只有接收者可以完成
        if (!currentUser.getId().equals(task.getReceiverId())) {
            return Result.fail("无权完成该任务").toJson();
        }

        // 更新状态
        task.setStatus("completed");
        task.setUpdatedAt(new Date());
        tasksService.updateById(task);

        // 记录日志
        TaskLogs log = new TaskLogs();
        log.setTaskId(taskId);
        log.setUserId(currentUser.getId());
        log.setAction("complete");
        log.setPreviousStatus("in-progress");
        log.setNewStatus("completed");
        log.setCreatedAt(new Date());
        taskLogsService.save(log);

        // 发放奖励
        List<TaskRewards> rewards = taskRewardsService.lambdaQuery()
                .eq(TaskRewards::getTaskId, taskId)
                .list();

        if (CollUtil.isNotEmpty(rewards)) {
            for (TaskRewards reward : rewards) {
                if ("points".equals(reward.getType()) && reward.getAmount() != null && reward.getAmount() > 0) {
                    // 增加积分
                    Integer currentPoints = currentUser.getPoints() == null ? 0 : currentUser.getPoints();
                    currentUser.setPoints(currentPoints + reward.getAmount());
                    usersService.updateById(currentUser);

                    // 记录积分流水
                    PointTransactions pt = new PointTransactions();
                    pt.setUserId(currentUser.getId());
                    pt.setAmount(reward.getAmount());
                    pt.setTransactionType("task_reward");
                    pt.setReferenceId(taskId);
                    pt.setDescription("完成任务奖励：" + task.getTitle());
                    pt.setCreatedAt(new Date());
                    pointTransactionsService.save(pt);
                } else if ("wildcard".equals(reward.getType()) || "normal".equals(reward.getType())) {
                    // 发放道具
                    int count = reward.getAmount() != null ? reward.getAmount() : 1;
                    for (int i = 0; i < count; i++) {
                        UserItems item = new UserItems();
                        item.setId(UUID.randomUUID().toString());
                        item.setUserId(currentUser.getId());
                        item.setItemId(reward.getId()); // 暂时使用 rewardId 作为 itemId
                        item.setStatus("usable");
                        item.setCode(UUID.randomUUID().toString().substring(0, 8).toUpperCase());
                        item.setAcquiredAt(new Date());
                        userItemsService.save(item);
                    }
                }
            }
        }

        return Result.success("任务完成").toJson();
    }
}
