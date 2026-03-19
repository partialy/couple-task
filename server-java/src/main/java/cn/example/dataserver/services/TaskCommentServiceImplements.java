package cn.example.dataserver.services;

import cn.example.dataserver.common.Result;
import cn.example.dataserver.dto.TaskCommentCreateDTO;
import cn.example.dataserver.entity.TaskComments;
import cn.example.dataserver.entity.Tasks;
import cn.example.dataserver.entity.Users;
import cn.example.dataserver.service.TaskCommentsService;
import cn.example.dataserver.service.TasksService;
import cn.example.dataserver.service.UsersService;
import cn.example.dataserver.vo.TaskCommentVO;
import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.util.ObjectUtil;
import cn.hutool.core.util.StrUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 任务评论业务逻辑实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TaskCommentServiceImplements {
    private final TaskCommentsService taskCommentsService;
    private final TasksService tasksService;
    private final UsersService usersService;
    private final AuthService authService;

    /**
     * 获取任务评论列表
     * @param token 认证令牌
     * @param taskId 任务ID
     * @return JSON 字符串
     */
    public String list(String token, String taskId) {
        authService.checkToken(token);
        if (StrUtil.isBlank(taskId)) {
            return Result.fail("任务ID不能为空").toJson();
        }

        Tasks task = tasksService.getById(taskId);
        if (ObjectUtil.isNull(task) || ObjectUtil.isNotNull(task.getDeletedAt())) {
            return Result.fail("任务不存在").toJson();
        }

        List<TaskComments> comments = taskCommentsService.lambdaQuery()
                .eq(TaskComments::getTaskId, taskId)
                .isNull(TaskComments::getDeletedAt)
                .orderByAsc(TaskComments::getCreatedAt)
                .list();
        if (CollUtil.isEmpty(comments)) {
            return Result.success(List.of()).toJson();
        }

        List<String> userIds = comments.stream().map(TaskComments::getUserId).distinct().collect(Collectors.toList());
        List<Users> users = usersService.lambdaQuery().in(Users::getId, userIds).list();

        List<TaskCommentVO> result = comments.stream().map(comment -> {
            Users user = users.stream().filter(u -> u.getId().equals(comment.getUserId())).findFirst().orElse(null);
            String nickname = ObjectUtil.isNotNull(user) && StrUtil.isNotBlank(user.getNickname()) ? user.getNickname() : "匿名用户";
            String avatar = ObjectUtil.isNotNull(user) ? user.getAvatar() : null;

            return TaskCommentVO.builder()
                    .id(comment.getId())
                    .taskId(comment.getTaskId())
                    .userId(comment.getUserId())
                    .content(comment.getContent())
                    .replyToId(comment.getReplyToId())
                    .createdAt(comment.getCreatedAt())
                    .userName(nickname)
                    .userAvatar(avatar)
                    .build();
        }).collect(Collectors.toList());

        return Result.success(result).toJson();
    }

    /**
     * 创建任务评论
     * @param token 认证令牌
     * @param createDTO 创建参数
     * @return JSON 字符串
     */
    @Transactional(rollbackFor = Exception.class)
    public String create(String token, TaskCommentCreateDTO createDTO) {
        Users currentUser = authService.checkToken(token);
        if (ObjectUtil.isNull(createDTO) || StrUtil.isBlank(createDTO.getTaskId())) {
            return Result.fail("任务ID不能为空").toJson();
        }
        if (StrUtil.isBlank(createDTO.getContent())) {
            return Result.fail("评论内容不能为空").toJson();
        }

        Tasks task = tasksService.getById(createDTO.getTaskId());
        if (ObjectUtil.isNull(task) || ObjectUtil.isNotNull(task.getDeletedAt())) {
            return Result.fail("任务不存在").toJson();
        }

        TaskComments comment = new TaskComments();
        comment.setId(UUID.randomUUID().toString());
        comment.setTaskId(createDTO.getTaskId());
        comment.setUserId(currentUser.getId());
        comment.setContent(createDTO.getContent().trim());
        comment.setReplyToId(StrUtil.isBlank(createDTO.getReplyToId()) ? null : createDTO.getReplyToId());
        comment.setCreatedAt(new Date());
        taskCommentsService.save(comment);

        String nickname = StrUtil.isNotBlank(currentUser.getNickname()) ? currentUser.getNickname() : "匿名用户";
        TaskCommentVO result = TaskCommentVO.builder()
                .id(comment.getId())
                .taskId(comment.getTaskId())
                .userId(comment.getUserId())
                .content(comment.getContent())
                .replyToId(comment.getReplyToId())
                .createdAt(comment.getCreatedAt())
                .userName(nickname)
                .userAvatar(currentUser.getAvatar())
                .build();

        return Result.success("评论成功", result).toJson();
    }

    /**
     * 删除任务评论
     * @param token 认证令牌
     * @param commentId 评论ID
     * @return JSON 字符串
     */
    @Transactional(rollbackFor = Exception.class)
    public String delete(String token, String commentId) {
        Users currentUser = authService.checkToken(token);
        if (StrUtil.isBlank(commentId)) {
            return Result.fail("评论ID不能为空").toJson();
        }

        TaskComments comment = taskCommentsService.getById(commentId);
        if (ObjectUtil.isNull(comment) || ObjectUtil.isNotNull(comment.getDeletedAt())) {
            return Result.fail("评论不存在").toJson();
        }
        if (!currentUser.getId().equals(comment.getUserId())) {
            return Result.fail("无权删除该评论").toJson();
        }

        comment.setDeletedAt(new Date());
        taskCommentsService.updateById(comment);
        return Result.success("删除成功").toJson();
    }
}
