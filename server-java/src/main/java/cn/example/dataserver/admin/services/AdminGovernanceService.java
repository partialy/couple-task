package cn.example.dataserver.admin.services;

import cn.example.dataserver.admin.common.AdminBusinessException;
import cn.example.dataserver.admin.common.AdminPageResponse;
import cn.example.dataserver.admin.dto.AdminFeedbackProcessDTO;
import cn.example.dataserver.admin.dto.AdminPageQueryDTO;
import cn.example.dataserver.entity.*;
import cn.example.dataserver.service.*;
import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminGovernanceService {

    private final BindMomentsService bindMomentsService;
    private final BindMomentCommentService bindMomentCommentService;
    private final DiaryEntriesService diaryEntriesService;
    private final SystemNoticesService systemNoticesService;
    private final SystemConfigService systemConfigService;
    private final FeedbacksService feedbacksService;
    private final CheckinPlansService checkinPlansService;
    private final CheckinRecordsService checkinRecordsService;
    private final AchievementsService achievementsService;

    public AdminPageResponse<BindMoments> pageMoments(AdminPageQueryDTO queryDTO) {
        LambdaQueryWrapper<BindMoments> wrapper = new LambdaQueryWrapper<>();
        if (StrUtil.isNotBlank(queryDTO.getKeyword())) {
            wrapper.like(BindMoments::getContent, queryDTO.getKeyword());
        }
        wrapper.orderByDesc(BindMoments::getCreatedAt);
        return toPage(bindMomentsService.page(new Page<>(queryDTO.getPage(), queryDTO.getPageSize()), wrapper));
    }

    public void deleteMoment(String id) {
        BindMoments moments = bindMomentsService.getById(id);
        if (moments == null) {
            throw new AdminBusinessException("动态不存在");
        }
        moments.setDeletedAt(new Date());
        bindMomentsService.updateById(moments);
    }

    public AdminPageResponse<BindMomentComment> pageMomentComments(AdminPageQueryDTO queryDTO) {
        LambdaQueryWrapper<BindMomentComment> wrapper = new LambdaQueryWrapper<>();
        if (StrUtil.isNotBlank(queryDTO.getKeyword())) {
            wrapper.like(BindMomentComment::getContent, queryDTO.getKeyword());
        }
        wrapper.orderByDesc(BindMomentComment::getCreatedAt);
        return toPage(bindMomentCommentService.page(new Page<>(queryDTO.getPage(), queryDTO.getPageSize()), wrapper));
    }

    public void deleteMomentComment(String id) {
        BindMomentComment comments = bindMomentCommentService.getById(id);
        if (comments == null) {
            throw new AdminBusinessException("评论不存在");
        }
        comments.setDeletedAt(new Date());
        bindMomentCommentService.updateById(comments);
    }

    public AdminPageResponse<DiaryEntries> pageDiaries(AdminPageQueryDTO queryDTO) {
        LambdaQueryWrapper<DiaryEntries> wrapper = new LambdaQueryWrapper<>();
        if (StrUtil.isNotBlank(queryDTO.getKeyword())) {
            wrapper.like(DiaryEntries::getContent, queryDTO.getKeyword());
        }
        wrapper.orderByDesc(DiaryEntries::getCreatedAt);
        return toPage(diaryEntriesService.page(new Page<>(queryDTO.getPage(), queryDTO.getPageSize()), wrapper));
    }

    public void deleteDiary(String id) {
        DiaryEntries diaryEntries = diaryEntriesService.getById(id);
        if (diaryEntries == null) {
            throw new AdminBusinessException("日记不存在");
        }
        diaryEntries.setDeletedAt(new Date());
        diaryEntriesService.updateById(diaryEntries);
    }

    public AdminPageResponse<SystemNotices> pageSystemNotices(AdminPageQueryDTO queryDTO) {
        LambdaQueryWrapper<SystemNotices> wrapper = new LambdaQueryWrapper<>();
        if (StrUtil.isNotBlank(queryDTO.getKeyword())) {
            wrapper.and(w -> w.like(SystemNotices::getTitle, queryDTO.getKeyword())
                    .or().like(SystemNotices::getContent, queryDTO.getKeyword()));
        }
        wrapper.orderByDesc(SystemNotices::getCreatedAt);
        return toPage(systemNoticesService.page(new Page<>(queryDTO.getPage(), queryDTO.getPageSize()), wrapper));
    }

    public void sendSystemNotice(SystemNotices payload) {
        payload.setId(UUID.randomUUID().toString());
        payload.setCreatedAt(new Date());
        payload.setIsRead(0);
        systemNoticesService.save(payload);
    }

    public AdminPageResponse<SystemConfig> pageSystemConfigs(AdminPageQueryDTO queryDTO) {
        LambdaQueryWrapper<SystemConfig> wrapper = new LambdaQueryWrapper<>();
        if (StrUtil.isNotBlank(queryDTO.getKeyword())) {
            wrapper.and(w -> w.like(SystemConfig::getConfigKey, queryDTO.getKeyword())
                    .or().like(SystemConfig::getDescription, queryDTO.getKeyword()));
        }
        wrapper.orderByDesc(SystemConfig::getUpdatedAt);
        return toPage(systemConfigService.page(new Page<>(queryDTO.getPage(), queryDTO.getPageSize()), wrapper));
    }

    public SystemConfig createSystemConfig(SystemConfig payload) {
        payload.setCreatedAt(new Date());
        payload.setUpdatedAt(new Date());
        if (payload.getIsEnabled() == null) {
            payload.setIsEnabled(1);
        }
        systemConfigService.save(payload);
        return payload;
    }

    public SystemConfig updateSystemConfig(Long id, SystemConfig payload) {
        SystemConfig db = systemConfigService.getById(id);
        if (db == null) {
            throw new AdminBusinessException("配置不存在");
        }
        payload.setId(id);
        payload.setCreatedAt(db.getCreatedAt());
        payload.setUpdatedAt(new Date());
        systemConfigService.updateById(payload);
        return payload;
    }

    public void updateSystemConfigEnabled(Long id, Integer enabled) {
        SystemConfig db = systemConfigService.getById(id);
        if (db == null) {
            throw new AdminBusinessException("配置不存在");
        }
        db.setIsEnabled(enabled);
        db.setUpdatedAt(new Date());
        systemConfigService.updateById(db);
    }

    public AdminPageResponse<Feedbacks> pageFeedbacks(AdminPageQueryDTO queryDTO) {
        LambdaQueryWrapper<Feedbacks> wrapper = new LambdaQueryWrapper<>();
        if (StrUtil.isNotBlank(queryDTO.getStatus())) {
            wrapper.eq(Feedbacks::getStatus, queryDTO.getStatus());
        }
        if (StrUtil.isNotBlank(queryDTO.getKeyword())) {
            wrapper.like(Feedbacks::getContent, queryDTO.getKeyword());
        }
        wrapper.orderByDesc(Feedbacks::getCreatedAt);
        return toPage(feedbacksService.page(new Page<>(queryDTO.getPage(), queryDTO.getPageSize()), wrapper));
    }

    public Feedbacks getFeedback(String id) {
        Feedbacks feedbacks = feedbacksService.getById(id);
        if (feedbacks == null) {
            throw new AdminBusinessException("反馈不存在");
        }
        return feedbacks;
    }

    public void processFeedback(String id, AdminFeedbackProcessDTO dto) {
        Feedbacks feedbacks = getFeedback(id);
        feedbacks.setStatus(dto.getStatus());
        feedbacks.setReply(dto.getReply());
        feedbacks.setUpdatedAt(new Date());
        feedbacksService.updateById(feedbacks);
    }

    public AdminPageResponse<CheckinPlans> pageCheckinPlans(AdminPageQueryDTO queryDTO) {
        LambdaQueryWrapper<CheckinPlans> wrapper = new LambdaQueryWrapper<>();
        if (StrUtil.isNotBlank(queryDTO.getStatus())) {
            wrapper.eq(CheckinPlans::getStatus, queryDTO.getStatus());
        }
        wrapper.orderByDesc(CheckinPlans::getCreatedAt);
        return toPage(checkinPlansService.page(new Page<>(queryDTO.getPage(), queryDTO.getPageSize()), wrapper));
    }

    public void updateCheckinPlanStatus(String id, String status) {
        CheckinPlans plans = checkinPlansService.getById(id);
        if (plans == null) {
            throw new AdminBusinessException("签到计划不存在");
        }
        plans.setStatus(status);
        plans.setUpdatedAt(new Date());
        checkinPlansService.updateById(plans);
    }

    public AdminPageResponse<CheckinRecords> pageCheckinRecords(AdminPageQueryDTO queryDTO) {
        LambdaQueryWrapper<CheckinRecords> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByDesc(CheckinRecords::getCheckinAt);
        return toPage(checkinRecordsService.page(new Page<>(queryDTO.getPage(), queryDTO.getPageSize()), wrapper));
    }

    public AdminPageResponse<Achievements> pageAchievements(AdminPageQueryDTO queryDTO) {
        LambdaQueryWrapper<Achievements> wrapper = new LambdaQueryWrapper<>();
        if (StrUtil.isNotBlank(queryDTO.getKeyword())) {
            wrapper.like(Achievements::getTitle, queryDTO.getKeyword());
        }
        wrapper.orderByAsc(Achievements::getSortOrder).orderByDesc(Achievements::getId);
        return toPage(achievementsService.page(new Page<>(queryDTO.getPage(), queryDTO.getPageSize()), wrapper));
    }

    public Achievements createAchievement(Achievements payload) {
        payload.setId(UUID.randomUUID().toString());
        achievementsService.save(payload);
        return payload;
    }

    public Achievements updateAchievement(String id, Achievements payload) {
        payload.setId(id);
        achievementsService.updateById(payload);
        return payload;
    }

    public void updateAchievementStatus(String id, String status) {
        Achievements achievements = achievementsService.getById(id);
        if (achievements == null) {
            throw new AdminBusinessException("成就不存在");
        }
        achievements.setDescription((achievements.getDescription() == null ? "" : achievements.getDescription())
                + " [status=" + status + "]");
        achievementsService.updateById(achievements);
    }

    private <T> AdminPageResponse<T> toPage(Page<T> page) {
        return AdminPageResponse.<T>builder()
                .list(page.getRecords())
                .page(page.getCurrent())
                .pageSize(page.getSize())
                .total(page.getTotal())
                .totalPages(page.getPages())
                .build();
    }
}
