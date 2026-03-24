package cn.example.dataserver.services;

import cn.example.dataserver.common.Result;
import cn.example.dataserver.dto.TaskDTO;
import cn.example.dataserver.entity.*;
import cn.example.dataserver.enums.BindingRelation;
import cn.example.dataserver.enums.RewardType;
import cn.example.dataserver.enums.TaskStatus;
import cn.example.dataserver.service.*;
import cn.example.dataserver.vo.PublisherVO;
import cn.example.dataserver.vo.TaskDetailVO;
import cn.example.dataserver.vo.TaskVO;
import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.TypeReference;
import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.util.ObjectUtil;
import cn.hutool.core.util.StrUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Collections;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 任务业务逻辑实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TaskServiceImplements {

    private static final String FAVORITE_TARGET_TASK = "task";
    /** 上架状态：草稿 / 已上架 / 已下架 */
    private static final String LIST_DRAFT = "draft";
    private static final String LIST_PUBLISHED = "published";
    private static final String LIST_UNPUBLISHED = "unpublished";

    private final TasksService tasksService;
    private final TaskRewardsService taskRewardsService;
    private final TaskImagesService taskImagesService;
    private final BindingRelationsService bindingRelationsService;
    private final AuthService authService;
    private final UsersService usersService;
    private final PointTransactionsService pointTransactionsService;
    private final UserItemsService userItemsService;
    private final TaskLogsService taskLogsService;
    private final TaskCommentsService taskCommentsService;
    private final CategoriesService categoriesService;
    private final TaskLevelsService taskLevelsService;
    private final CardTransactionsService cardTransactionsService;
    private final ItemTransactionsService itemTransactionsService;
    private final UserFavoritesService userFavoritesService;

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

        boolean saveAsDraft = Boolean.TRUE.equals(taskDTO.getSaveAsDraft());
        if (!saveAsDraft && StrUtil.isBlank(taskDTO.getTitle())) {
            return Result.fail("请填写任务标题").toJson();
        }

        // 2. 创建任务实体
        Tasks task = new Tasks();
        String taskId = UUID.randomUUID().toString();
        task.setId(taskId);
        task.setAuthorId(userId);
        task.setBelongBindingId(bindRelation.getId());
        task.setReceiverId(userId.equals(bindRelation.getUserId()) ? bindRelation.getTargetId() : bindRelation.getUserId());
        if (saveAsDraft) {
            task.setTitle(StrUtil.isBlank(taskDTO.getTitle()) ? "(无标题草稿)" : taskDTO.getTitle().trim());
            task.setListStatus(LIST_DRAFT);
        } else {
            task.setTitle(taskDTO.getTitle().trim());
            task.setListStatus(LIST_PUBLISHED);
        }
        task.setDescription(taskDTO.getDescription());
        task.setCoverImage(taskDTO.getCoverImage());
        task.setCategoryId(StrUtil.isNotBlank(taskDTO.getCategoryId()) ? taskDTO.getCategoryId() : null);
        task.setLevelId(StrUtil.isNotBlank(taskDTO.getLevelId()) ? taskDTO.getLevelId() : null);
        task.setStatus(TaskStatus.PENDING.getValue()); // 初始状态为待处理
        task.setIsPrivate(taskDTO.getIsPrivate() ? 1 : 0);
        task.setIsPrivileged(taskDTO.getIsPrivileged() ? 1 : 0);
        task.setRepeatType(StrUtil.isNotBlank(taskDTO.getTaskType()) ? taskDTO.getTaskType() : "one-time");
        task.setRepeatConfig(taskDTO.getRepeatConfig());
        task.setTags(CollUtil.isNotEmpty(taskDTO.getTags()) ? JSON.toJSONString(taskDTO.getTags()) : null);
        task.setCreatedAt(new Date());
        task.setUpdatedAt(new Date());
        
        // 解析截止日期
        if (StrUtil.isNotBlank(taskDTO.getDeadline())) {
            try {
                task.setDeadline(new SimpleDateFormat("yyyy-MM-dd").parse(taskDTO.getDeadline()));
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
                String desc = r.getDescription() == null ? r.getText() : r.getDescription();
                reward.setId(UUID.randomUUID().toString());
                reward.setTaskId(taskId);
                reward.setType(r.getType());
                reward.setContent(r.getText());
                reward.setIcon(r.getIcon());
                reward.setColor(r.getColor());
                reward.setAmount(r.getAmount());
                reward.setDescription(desc);
                return reward;
            }).collect(Collectors.toList());
            taskRewardsService.saveBatch(rewards);
        }

        if (saveAsDraft) {
            return Result.success("草稿已保存", taskId).toJson();
        }
        return Result.success("任务发布成功", taskId).toJson();
    }

    /**
     * 下架：仅作者、待接取、已上架
     */
    @Transactional(rollbackFor = Exception.class)
    public String unpublishTask(String token, String taskId) {
        Users currentUser = authService.checkToken(token);
        if (ObjectUtil.isNull(currentUser)) {
            return Result.unauthorized("登录已过期，请重新登录").toJson();
        }
        if (StrUtil.isBlank(taskId)) {
            return Result.fail("任务ID不能为空").toJson();
        }
        Tasks task = tasksService.getById(taskId);
        if (ObjectUtil.isNull(task) || ObjectUtil.isNotNull(task.getDeletedAt())) {
            return Result.fail("任务不存在").toJson();
        }
        if (!StrUtil.equals(task.getAuthorId(), currentUser.getId())) {
            return Result.fail("只有发布者可以下架").toJson();
        }
        if (!TaskStatus.PENDING.getValue().equals(task.getStatus())) {
            return Result.fail("仅待接取状态的任务可下架").toJson();
        }
        if (!LIST_PUBLISHED.equals(normalizeListStatus(task.getListStatus()))) {
            return Result.fail("当前任务不是上架状态").toJson();
        }
        task.setListStatus(LIST_UNPUBLISHED);
        task.setUpdatedAt(new Date());
        tasksService.updateById(task);
        return Result.success("已下架").toJson();
    }

    /**
     * 上架（含草稿首次发布）：仅作者、待接取、草稿或已下架
     */
    @Transactional(rollbackFor = Exception.class)
    public String publishListing(String token, String taskId) {
        Users currentUser = authService.checkToken(token);
        if (ObjectUtil.isNull(currentUser)) {
            return Result.unauthorized("登录已过期，请重新登录").toJson();
        }
        if (StrUtil.isBlank(taskId)) {
            return Result.fail("任务ID不能为空").toJson();
        }
        Tasks task = tasksService.getById(taskId);
        if (ObjectUtil.isNull(task) || ObjectUtil.isNotNull(task.getDeletedAt())) {
            return Result.fail("任务不存在").toJson();
        }
        if (!StrUtil.equals(task.getAuthorId(), currentUser.getId())) {
            return Result.fail("只有发布者可以上架").toJson();
        }
        if (!TaskStatus.PENDING.getValue().equals(task.getStatus())) {
            return Result.fail("仅待接取状态的任务可上架").toJson();
        }
        String ls = normalizeListStatus(task.getListStatus());
        if (!LIST_DRAFT.equals(ls) && !LIST_UNPUBLISHED.equals(ls)) {
            return Result.fail("当前状态不可上架").toJson();
        }
        if (StrUtil.isBlank(task.getTitle()) || "(无标题草稿)".equals(task.getTitle())) {
            return Result.fail("请先完善任务标题后再上架").toJson();
        }
        task.setListStatus(LIST_PUBLISHED);
        task.setUpdatedAt(new Date());
        tasksService.updateById(task);
        return Result.success("已上架").toJson();
    }

    /**
     * 删除任务（软删除）：仅发布者、待接取状态
     *
     * @param token   认证令牌
     * @param taskId  任务主键
     * @return JSON 字符串
     */
    @Transactional(rollbackFor = Exception.class)
    public String deleteTask(String token, String taskId) {
        Users currentUser = authService.checkToken(token);
        if (ObjectUtil.isNull(currentUser)) {
            return Result.unauthorized("登录已过期，请重新登录").toJson();
        }
        if (StrUtil.isBlank(taskId)) {
            return Result.fail("任务ID不能为空").toJson();
        }
        Tasks task = tasksService.getById(taskId);
        if (ObjectUtil.isNull(task) || ObjectUtil.isNotNull(task.getDeletedAt())) {
            return Result.fail("任务不存在").toJson();
        }
        if (!StrUtil.equals(task.getAuthorId(), currentUser.getId())) {
            return Result.fail("只有发布者可以删除").toJson();
        }
        if (!TaskStatus.PENDING.getValue().equals(task.getStatus())) {
            return Result.fail("仅待接取状态的任务可删除").toJson();
        }
        Date now = new Date();
        task.setDeletedAt(now);
        task.setUpdatedAt(now);
        tasksService.updateById(task);
        userFavoritesService.lambdaUpdate()
                .eq(UserFavorites::getTargetType, FAVORITE_TARGET_TASK)
                .eq(UserFavorites::getTargetId, taskId)
                .remove();
        return Result.success("删除成功").toJson();
    }

    private static String normalizeListStatus(String listStatus) {
        return StrUtil.isBlank(listStatus) ? LIST_PUBLISHED : listStatus;
    }

    /**
     * 更新任务（仅发布者可编辑，不修改状态/接取关系）
     */
    @Transactional(rollbackFor = Exception.class)
    public String update(String token, String taskId, TaskDTO taskDTO) {
        Users currentUser = authService.checkToken(token);
        if (ObjectUtil.isNull(currentUser)) {
            return Result.unauthorized("登录已过期，请重新登录").toJson();
        }
        if (StrUtil.isBlank(taskId)) {
            return Result.fail("任务ID不能为空").toJson();
        }
        Tasks task = tasksService.getById(taskId);
        if (ObjectUtil.isNull(task) || ObjectUtil.isNotNull(task.getDeletedAt())) {
            return Result.fail("任务不存在").toJson();
        }
        if (!StrUtil.equals(task.getAuthorId(), currentUser.getId())) {
            return Result.fail("只有任务发布者可以编辑").toJson();
        }

        task.setTitle(taskDTO.getTitle());
        task.setDescription(taskDTO.getDescription());
        task.setCoverImage(taskDTO.getCoverImage());
        task.setCategoryId(StrUtil.isNotBlank(taskDTO.getCategoryId()) ? taskDTO.getCategoryId() : null);
        task.setLevelId(StrUtil.isNotBlank(taskDTO.getLevelId()) ? taskDTO.getLevelId() : null);
        task.setIsPrivate(taskDTO.getIsPrivate() ? 1 : 0);
        task.setIsPrivileged(taskDTO.getIsPrivileged() ? 1 : 0);
        task.setRepeatType(StrUtil.isNotBlank(taskDTO.getTaskType()) ? taskDTO.getTaskType() : task.getRepeatType());
        task.setRepeatConfig(taskDTO.getRepeatConfig());
        task.setTags(CollUtil.isNotEmpty(taskDTO.getTags()) ? JSON.toJSONString(taskDTO.getTags()) : null);
        task.setUpdatedAt(new Date());

        if (StrUtil.isNotBlank(taskDTO.getDeadline())) {
            try {
                task.setDeadline(new SimpleDateFormat("yyyy-MM-dd").parse(taskDTO.getDeadline()));
            } catch (Exception e) {
                log.error("解析截止日期出错：", e);
            }
        } else {
            task.setDeadline(null);
        }

        tasksService.updateById(task);

        taskImagesService.lambdaUpdate().eq(TaskImages::getTaskId, taskId).remove();
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

        taskRewardsService.lambdaUpdate().eq(TaskRewards::getTaskId, taskId).remove();
        if (CollUtil.isNotEmpty(taskDTO.getRewards())) {
            List<TaskRewards> rewards = taskDTO.getRewards().stream().map(r -> {
                TaskRewards reward = new TaskRewards();
                String desc = r.getDescription() == null ? r.getText() : r.getDescription();
                reward.setId(UUID.randomUUID().toString());
                reward.setTaskId(taskId);
                reward.setType(r.getType());
                reward.setContent(r.getText());
                reward.setIcon(r.getIcon());
                reward.setColor(r.getColor());
                reward.setAmount(r.getAmount());
                reward.setDescription(desc);
                return reward;
            }).collect(Collectors.toList());
            taskRewardsService.saveBatch(rewards);
        }

        return Result.success("任务已更新", taskId).toJson();
    }

    /**
     * 获取任务列表
     * @param token 认证令牌
     * @return JSON 字符串
     */
    public String list(String token) {
        // 1. 验证用户
        Users currentUser = authService.checkToken(token);
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
                .isNull(Tasks::getDeletedAt)
                .orderByDesc(Tasks::getCreatedAt)
                .list();

        // 4. 组装 VO
        List<TaskVO> taskVOs = tasks.stream().map(task -> {
            TaskVO vo = new TaskVO();
            BeanUtils.copyProperties(task, vo);
            vo.setListStatus(normalizeListStatus(task.getListStatus()));

            // 获取发布者
            Users author = usersService.lambdaQuery()
                    .eq(Users::getId, task.getAuthorId())
                    .one();
            vo.setAuthorAvatar(author.getAvatar());
            vo.setAuthorName(author.getNickname());
            vo.setGender(author.getGender());

            // 获取分类
            Categories category = task.getCategoryId() == null ? null : categoriesService.lambdaQuery()
                    .eq(Categories::getId, task.getCategoryId())
                    .one();
            vo.setCategory(category != null ? category.getName() : "");
            // 获取等级
            TaskLevels level = task.getLevelId() == null ? null : taskLevelsService.lambdaQuery()
                    .eq(TaskLevels::getId, task.getLevelId())
                    .one();
            vo.setLevel(level != null ? level.getName() : "");

            // 获取奖励
            List<TaskRewards> rewards = taskRewardsService.lambdaQuery()
                    .eq(TaskRewards::getTaskId, task.getId())
                    .list();
            vo.setRewards(rewards);
            
            // 从 tasks.tags(json) 读取标签
            vo.setTags(parseTaskTags(task.getTags()));
            
            // 获取图片
            List<TaskImages> images = taskImagesService.lambdaQuery()
                    .eq(TaskImages::getTaskId, task.getId())
                    .list();
            vo.setImages(images);
            
            return vo;
        }).collect(Collectors.toList());

        // 当前用户已收藏的任务 ID（user_favorites.target_type = task）
        if (CollUtil.isNotEmpty(taskVOs)) {
            List<String> taskIds = tasks.stream().map(Tasks::getId).collect(Collectors.toList());
            List<UserFavorites> favs = userFavoritesService.lambdaQuery()
                    .eq(UserFavorites::getUserId, userId)
                    .eq(UserFavorites::getTargetType, FAVORITE_TARGET_TASK)
                    .in(UserFavorites::getTargetId, taskIds)
                    .list();
            Set<String> favorited = favs.stream()
                    .map(UserFavorites::getTargetId)
                    .collect(Collectors.toCollection(HashSet::new));
            for (int i = 0; i < taskVOs.size(); i++) {
                taskVOs.get(i).setIsBookmarked(favorited.contains(tasks.get(i).getId()));
            }
        }

        return Result.success(taskVOs).toJson();
    }

    /**
     * 获取任务详情
     * @param token 认证令牌
     * @param taskId 任务ID
     * @return JSON 字符串
     */
    public String detail(String token, String taskId) {
        Users currentUser = authService.checkToken(token);
        if (StrUtil.isBlank(taskId)) {
            return Result.fail("任务ID不能为空").toJson();
        }

        Tasks task = tasksService.getById(taskId);
        if (ObjectUtil.isNull(task) || ObjectUtil.isNotNull(task.getDeletedAt())) {
            return Result.fail("任务不存在").toJson();
        }

        String ls = normalizeListStatus(task.getListStatus());
        boolean isAuthor = StrUtil.equals(task.getAuthorId(), currentUser.getId());
        if (!isAuthor) {
            if (!StrUtil.equals(currentUser.getId(), task.getReceiverId())) {
                return Result.fail("无权查看该任务").toJson();
            }
            if (!LIST_PUBLISHED.equals(ls)) {
                return Result.fail("任务未上架").toJson();
            }
        }

        TaskDetailVO detailVO = new TaskDetailVO();
        BeanUtils.copyProperties(task, detailVO);
        detailVO.setListStatus(ls);

        // 获取奖励
        List<TaskRewards> rewards = taskRewardsService.lambdaQuery()
                .eq(TaskRewards::getTaskId, task.getId())
                .list();
        detailVO.setRewards(rewards);

        // 从 tasks.tags(json) 读取标签
        detailVO.setTags(parseTaskTags(task.getTags()));

        // 获取图片
        List<TaskImages> images = taskImagesService.lambdaQuery()
                .eq(TaskImages::getTaskId, task.getId())
                .list();
        detailVO.setImages(images);

        // 获取发布人公开信息
        Users author = usersService.getById(task.getAuthorId());
        if (ObjectUtil.isNotNull(author)) {
            String nickname = StrUtil.isNotBlank(author.getNickname()) ? author.getNickname() : author.getUsername();
            detailVO.setPublisher(PublisherVO.builder()
                    .id(author.getId())
                    .nickname(nickname)
                    .avatar(author.getAvatar())
                    .level(author.getLevel())
                    .title(author.getTitle())
                    .build());
        }

        // 获取评论数量
        long commentCount = taskCommentsService.lambdaQuery()
                .eq(TaskComments::getTaskId, task.getId())
                .isNull(TaskComments::getDeletedAt)
                .count();
        detailVO.setCommentCount(commentCount);

        boolean bookmarked = userFavoritesService.lambdaQuery()
                .eq(UserFavorites::getUserId, currentUser.getId())
                .eq(UserFavorites::getTargetType, FAVORITE_TARGET_TASK)
                .eq(UserFavorites::getTargetId, taskId)
                .count() > 0;
        detailVO.setIsBookmarked(bookmarked);

        return Result.success(detailVO).toJson();
    }

    /**
     * 收藏任务
     */
    @Transactional(rollbackFor = Exception.class)
    public String addFavorite(String token, String taskId) {
        Users currentUser = authService.checkToken(token);
        if (StrUtil.isBlank(taskId)) {
            return Result.fail("任务ID不能为空").toJson();
        }
        Tasks task = tasksService.getById(taskId);
        if (ObjectUtil.isNull(task) || ObjectUtil.isNotNull(task.getDeletedAt())) {
            return Result.fail("任务不存在").toJson();
        }
        long exists = userFavoritesService.lambdaQuery()
                .eq(UserFavorites::getUserId, currentUser.getId())
                .eq(UserFavorites::getTargetType, FAVORITE_TARGET_TASK)
                .eq(UserFavorites::getTargetId, taskId)
                .count();
        if (exists > 0) {
            return Result.success("已收藏").toJson();
        }
        UserFavorites fav = new UserFavorites();
        fav.setId(UUID.randomUUID().toString());
        fav.setUserId(currentUser.getId());
        fav.setTargetType(FAVORITE_TARGET_TASK);
        fav.setTargetId(taskId);
        fav.setCreatedAt(new Date());
        userFavoritesService.save(fav);
        return Result.success("收藏成功").toJson();
    }

    /**
     * 取消收藏任务
     */
    @Transactional(rollbackFor = Exception.class)
    public String removeFavorite(String token, String taskId) {
        Users currentUser = authService.checkToken(token);
        if (StrUtil.isBlank(taskId)) {
            return Result.fail("任务ID不能为空").toJson();
        }
        userFavoritesService.lambdaUpdate()
                .eq(UserFavorites::getUserId, currentUser.getId())
                .eq(UserFavorites::getTargetType, FAVORITE_TARGET_TASK)
                .eq(UserFavorites::getTargetId, taskId)
                .remove();
        return Result.success("已取消收藏").toJson();
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
        Tasks task = tasksService.getById(taskId);
        if (ObjectUtil.isNull(task) || ObjectUtil.isNotNull(task.getDeletedAt())) {
            return Result.fail("任务不存在").toJson();
        }

        if (!TaskStatus.PENDING.getValue().equals(task.getStatus())) {
            return Result.fail("任务状态不允许接取").toJson();
        }

        if (!LIST_PUBLISHED.equals(normalizeListStatus(task.getListStatus()))) {
            return Result.fail("任务未上架，无法接取").toJson();
        }

        // 验证权限：只有接收者可以接取
        if (!currentUser.getId().equals(task.getReceiverId())) {
            return Result.fail("无权接取该任务").toJson();
        }

        // 更新状态
        task.setStatus(TaskStatus.IN_PROGRESS.getValue());
        task.setUpdatedAt(new Date());
        tasksService.updateById(task);

        // 记录日志
        TaskLogs log = new TaskLogs();
        log.setTaskId(taskId);
        log.setUserId(currentUser.getId());
        log.setAction("accept");
        log.setPreviousStatus(TaskStatus.PENDING.getValue());
        log.setNewStatus(TaskStatus.IN_PROGRESS.getValue());
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
        Tasks task = tasksService.getById(taskId);
        if (ObjectUtil.isNull(task)) {
            return Result.fail("任务不存在").toJson();
        }

        if (!TaskStatus.IN_PROGRESS.getValue().equals(task.getStatus())) {
            return Result.fail("任务状态不允许放弃").toJson();
        }

        // 验证权限：作者或接收者都可以撤回到 pending
        boolean isReceiver = currentUser.getId().equals(task.getReceiverId());
        boolean isAuthor = currentUser.getId().equals(task.getAuthorId());
        if (!isReceiver && !isAuthor) {
            return Result.fail("无权放弃/撤回该任务").toJson();
        }

        // 更新状态
        task.setStatus(TaskStatus.PENDING.getValue());
        task.setUpdatedAt(new Date());
        tasksService.updateById(task);

        // 记录日志
        TaskLogs log = new TaskLogs();
        log.setTaskId(taskId);
        log.setUserId(currentUser.getId());
        log.setAction("abandon");
        log.setPreviousStatus(TaskStatus.IN_PROGRESS.getValue());
        log.setNewStatus(TaskStatus.PENDING.getValue());
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
        Tasks task = tasksService.getById(taskId);
        if (ObjectUtil.isNull(task)) {
            return Result.fail("任务不存在").toJson();
        }

        if (!TaskStatus.IN_PROGRESS.getValue().equals(task.getStatus())
                && !TaskStatus.APPLYING.getValue().equals(task.getStatus())) {
            return Result.fail("任务状态不允许完成").toJson();
        }

        // 验证权限：只有作者可以确认对方完成
        if (!currentUser.getId().equals(task.getAuthorId())) {
            return Result.fail("无权确认对方完成该任务").toJson();
        }

        String receiverId = task.getReceiverId();
        if (StrUtil.isBlank(receiverId)) {
            return Result.fail("任务接收人不存在").toJson();
        }
        Users receiver = usersService.getById(receiverId);
        if (ObjectUtil.isNull(receiver)) {
            return Result.fail("任务接收人不存在").toJson();
        }

        // 更新状态
        task.setStatus(TaskStatus.COMPLETED.getValue());
        task.setUpdatedAt(new Date());
        tasksService.updateById(task);

        // 记录日志
        TaskLogs log = new TaskLogs();
        log.setTaskId(taskId);
        log.setUserId(currentUser.getId());
        log.setAction("complete");
        log.setPreviousStatus(TaskStatus.APPLYING.getValue());
        log.setNewStatus(TaskStatus.COMPLETED.getValue());
        log.setCreatedAt(new Date());
        taskLogsService.save(log);

        // 发放奖励
        List<TaskRewards> rewards = taskRewardsService.lambdaQuery()
                .eq(TaskRewards::getTaskId, taskId)
                .list();

        if (CollUtil.isNotEmpty(rewards)) {
            for (TaskRewards reward : rewards) {
                Integer rewardAmount = reward.getAmount() == null ? 0 : reward.getAmount();
                if (RewardType.POINTS.getValue().equals(reward.getType()) && rewardAmount > 0) {
                    // 增加积分（奖励发给接收人）
                    Integer currentPoints = receiver.getPoints() == null ? 0 : receiver.getPoints();
                    receiver.setPoints(currentPoints + rewardAmount);
                    usersService.updateById(receiver);

                    // 记录积分流水
                    PointTransactions pt = new PointTransactions();
                    pt.setUserId(receiver.getId());
                    pt.setAmount(rewardAmount);
                    pt.setTransactionType("task_reward");
                    pt.setReferenceId(taskId);
                    pt.setDescription("完成任务奖励：" + task.getTitle());
                    pt.setCreatedAt(new Date());
                    pointTransactionsService.save(pt);
                } else if (RewardType.WILD_CARD.getValue().equals(reward.getType())) {
                    // 万能卡
                    Integer cards = receiver.getCards() == null ? 0 : receiver.getCards();
                    receiver.setCards(cards + rewardAmount);
                    usersService.updateById(receiver);

                    // 流水
                    CardTransactions ct = new CardTransactions();
                    ct.setUserId(receiver.getId());
                    ct.setAmount(rewardAmount);
                    ct.setTransactionType("card_reward");
                    ct.setReferenceId(taskId);
                    ct.setDescription("完成任务奖励：" + task.getTitle());
                    ct.setCreatedAt(new Date());
                    cardTransactionsService.save(ct);
                } else if (RewardType.NORMAL.getValue().equals(reward.getType())) {
                    // 发放道具
                    PointsServiceImplements.saveUserItem(
                            receiver,
                            reward.getId(),
                            reward.getContent(),
                            reward.getDescription(),
                            reward.getIcon(),
                            RewardType.NORMAL.getValue(),
                            reward.getColor(),
                            userItemsService
                    );
                    // 流水
                    ItemTransactions it = new ItemTransactions();
                    it.setUserId(currentUser.getId());
                    it.setItemId(reward.getId());
                    it.setTransactionType("task_reward");
                    it.setReferenceId(taskId);
                    it.setDescription("任务奖励：" + task.getTitle());
                    it.setCreatedAt(new Date());
                    it.setQuantity(rewardAmount);
                    itemTransactionsService.save(it);
                }
            }
        }
        return Result.success("任务完成").toJson();
    }

    /**
     * 申请完成任务（接收者）
     */
    @Transactional(rollbackFor = Exception.class)
    public String applyCompleteTask(String token, String taskId) {
        Users currentUser = authService.checkToken(token);
        if (ObjectUtil.isNull(currentUser)) {
            return Result.unauthorized("登录已过期，请重新登录").toJson();
        }
        Tasks task = tasksService.getById(taskId);
        if (ObjectUtil.isNull(task) || ObjectUtil.isNotNull(task.getDeletedAt())) {
            return Result.fail("任务不存在").toJson();
        }
        if (!TaskStatus.IN_PROGRESS.getValue().equals(task.getStatus())) {
            return Result.fail("任务状态不允许申请完成").toJson();
        }
        if (!currentUser.getId().equals(task.getReceiverId())) {
            return Result.fail("仅接取人可申请完成").toJson();
        }

        task.setStatus(TaskStatus.APPLYING.getValue());
        task.setUpdatedAt(new Date());
        tasksService.updateById(task);

        TaskLogs log = new TaskLogs();
        log.setTaskId(taskId);
        log.setUserId(currentUser.getId());
        log.setAction("apply_complete");
        log.setPreviousStatus(TaskStatus.IN_PROGRESS.getValue());
        log.setNewStatus(TaskStatus.APPLYING.getValue());
        log.setCreatedAt(new Date());
        taskLogsService.save(log);

        return Result.success("已提交完成申请").toJson();
    }

    /**
     * 审核同意（发布者）：applying -> completed
     */
    @Transactional(rollbackFor = Exception.class)
    public String approveTaskAudit(String token, String taskId) {
        return this.completeTask(token, taskId);
    }

    /**
     * 审核拒绝（发布者）：applying -> in-progress
     */
    @Transactional(rollbackFor = Exception.class)
    public String rejectTaskAudit(String token, String taskId) {
        Users currentUser = authService.checkToken(token);
        Tasks task = tasksService.getById(taskId);
        if (ObjectUtil.isNull(task) || ObjectUtil.isNotNull(task.getDeletedAt())) {
            return Result.fail("任务不存在").toJson();
        }
        if (!TaskStatus.APPLYING.getValue().equals(task.getStatus())) {
            return Result.fail("任务状态不允许审核拒绝").toJson();
        }
        if (!currentUser.getId().equals(task.getAuthorId())) {
            return Result.fail("仅发布者可审核").toJson();
        }

        task.setStatus(TaskStatus.IN_PROGRESS.getValue());
        task.setUpdatedAt(new Date());
        tasksService.updateById(task);

        TaskLogs log = new TaskLogs();
        log.setTaskId(taskId);
        log.setUserId(currentUser.getId());
        log.setAction("audit_reject");
        log.setPreviousStatus(TaskStatus.APPLYING.getValue());
        log.setNewStatus(TaskStatus.IN_PROGRESS.getValue());
        log.setCreatedAt(new Date());
        taskLogsService.save(log);

        return Result.success("已拒绝该申请").toJson();
    }

    private List<String> parseTaskTags(Object rawTags) {
        if (ObjectUtil.isNull(rawTags)) {
            return Collections.emptyList();
        }
        try {
            if (rawTags instanceof String rawJson) {
                if (StrUtil.isBlank(rawJson)) {
                    return Collections.emptyList();
                }
                return JSON.parseObject(rawJson, new TypeReference<List<String>>() {});
            }
            if (rawTags instanceof List<?>) {
                return ((List<?>) rawTags).stream()
                        .filter(ObjectUtil::isNotNull)
                        .map(String::valueOf)
                        .collect(Collectors.toList());
            }
            String normalized = JSON.toJSONString(rawTags);
            return JSON.parseObject(normalized, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            log.warn("解析任务标签失败, rawTags={}", rawTags, e);
            return Collections.emptyList();
        }
    }
}
