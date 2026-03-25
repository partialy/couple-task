package cn.example.dataserver.services;

import cn.example.dataserver.common.BusinessException;
import cn.example.dataserver.common.Result;
import cn.example.dataserver.dto.CheckinPlanDTO;
import cn.example.dataserver.dto.CheckinPlanStatusDTO;
import cn.example.dataserver.entity.*;
import cn.example.dataserver.enums.BindingRelation;
import cn.example.dataserver.service.*;
import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.util.ObjectUtil;
import cn.hutool.core.util.StrUtil;
import com.alibaba.fastjson2.JSON;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 签到模块核心业务逻辑
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CheckinServiceImplements {

    private static final String STATUS_ACTIVE = "active";
    private static final String STATUS_INACTIVE = "inactive";
    private static final String CYCLE_WEEKLY = "weekly";
    private static final String CYCLE_MONTHLY = "monthly";

    private final AuthService authService;
    private final BindingRelationsService bindingRelationsService;
    private final CheckinPlansService checkinPlansService;
    private final CheckinDayRewardsService checkinDayRewardsService;
    private final CheckinRecordsService checkinRecordsService;
    private final UsersService usersService;
    private final PointTransactionsService pointTransactionsService;
    private final CardTransactionsService cardTransactionsService;

    /**
     * 获取已接受的绑定关系
     */
    private BindingRelations resolveAcceptedBinding(String userId) {
        return bindingRelationsService.lambdaQuery()
                .and(w -> w.eq(BindingRelations::getUserId, userId)
                        .or().eq(BindingRelations::getTargetId, userId))
                .eq(BindingRelations::getStatus, BindingRelation.ACCEPTED.getValue())
                .one();
    }

    /**
     * 绑定中对方 userId
     */
    private String partnerUserId(BindingRelations bind, String currentUserId) {
        if (bind == null) return null;
        return currentUserId.equals(bind.getUserId()) ? bind.getTargetId() : bind.getUserId();
    }

    // ==================== 签到计划管理 ====================

    /**
     * 创建签到计划（含每日奖励）
     */
    @Transactional(rollbackFor = Exception.class)
    public String createPlan(String token, CheckinPlanDTO dto) {
        Users user = authService.checkToken(token);
        BindingRelations bind = resolveAcceptedBinding(user.getId());
        if (bind == null) {
            return Result.fail("请先绑定另一半").toJson();
        }
        if (StrUtil.isBlank(dto.getName())) {
            return Result.fail("计划名称不能为空").toJson();
        }
        if (StrUtil.isBlank(dto.getCycleType()) ||
                (!CYCLE_WEEKLY.equals(dto.getCycleType()) && !CYCLE_MONTHLY.equals(dto.getCycleType()))) {
            return Result.fail("周期类型必须是 weekly 或 monthly").toJson();
        }

        String partnerId = partnerUserId(bind, user.getId());
        if (StrUtil.isBlank(partnerId)) {
            return Result.fail("无法解析对方用户").toJson();
        }

        int cycleDays = CYCLE_WEEKLY.equals(dto.getCycleType()) ? 7 : 30;
        Date now = new Date();

        CheckinPlans plan = CheckinPlans.builder()
                .id(UUID.randomUUID().toString())
                .belongBindingId(bind.getId())
                .creatorId(user.getId())
                .targetUserId(partnerId)
                .name(dto.getName().trim())
                .description(StrUtil.isBlank(dto.getDescription()) ? null : dto.getDescription().trim())
                .icon(StrUtil.blankToDefault(dto.getIcon(), "calendar-check"))
                .color(StrUtil.blankToDefault(dto.getColor(), "emerald"))
                .cycleType(dto.getCycleType())
                .cycleDays(cycleDays)
                .isConsecutive(dto.getIsConsecutive() != null ? dto.getIsConsecutive() : 0)
                .timeWindows(dto.getTimeWindows() != null ? JSON.toJSONString(dto.getTimeWindows()) : null)
                .status(STATUS_ACTIVE)
                .createdAt(now)
                .updatedAt(now)
                .build();

        checkinPlansService.save(plan);

        if (CollUtil.isNotEmpty(dto.getDayRewards())) {
            saveDayRewards(plan.getId(), dto.getDayRewards());
        }

        Map<String, Object> result = new HashMap<>();
        result.put("plan", plan);
        result.put("dayRewards", checkinDayRewardsService.lambdaQuery()
                .eq(CheckinDayRewards::getPlanId, plan.getId())
                .orderByAsc(CheckinDayRewards::getDayNumber)
                .orderByAsc(CheckinDayRewards::getSortOrder)
                .list());
        return Result.success(result).toJson();
    }

    /**
     * 更新签到计划
     */
    @Transactional(rollbackFor = Exception.class)
    public String updatePlan(String token, String planId, CheckinPlanDTO dto) {
        Users user = authService.checkToken(token);
        CheckinPlans plan = checkinPlansService.getById(planId);
        if (plan == null || plan.getDeletedAt() != null) {
            return Result.fail("计划不存在").toJson();
        }
        if (!user.getId().equals(plan.getCreatorId())) {
            return Result.fail("无权编辑该计划").toJson();
        }

        if (StrUtil.isNotBlank(dto.getName())) {
            plan.setName(dto.getName().trim());
        }
        if (dto.getDescription() != null) {
            plan.setDescription(StrUtil.isBlank(dto.getDescription()) ? null : dto.getDescription().trim());
        }
        if (dto.getIcon() != null) {
            plan.setIcon(dto.getIcon());
        }
        if (dto.getColor() != null) {
            plan.setColor(dto.getColor());
        }
        if (dto.getCycleType() != null) {
            if (!CYCLE_WEEKLY.equals(dto.getCycleType()) && !CYCLE_MONTHLY.equals(dto.getCycleType())) {
                return Result.fail("周期类型必须是 weekly 或 monthly").toJson();
            }
            plan.setCycleType(dto.getCycleType());
            plan.setCycleDays(CYCLE_WEEKLY.equals(dto.getCycleType()) ? 7 : 30);
        }
        if (dto.getIsConsecutive() != null) {
            plan.setIsConsecutive(dto.getIsConsecutive());
        }
        if (dto.getTimeWindows() != null) {
            plan.setTimeWindows(JSON.toJSONString(dto.getTimeWindows()));
        }
        plan.setUpdatedAt(new Date());
        checkinPlansService.updateById(plan);

        if (dto.getDayRewards() != null) {
            checkinDayRewardsService.lambdaUpdate()
                    .eq(CheckinDayRewards::getPlanId, planId)
                    .remove();
            if (CollUtil.isNotEmpty(dto.getDayRewards())) {
                saveDayRewards(planId, dto.getDayRewards());
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("plan", plan);
        result.put("dayRewards", checkinDayRewardsService.lambdaQuery()
                .eq(CheckinDayRewards::getPlanId, planId)
                .orderByAsc(CheckinDayRewards::getDayNumber)
                .orderByAsc(CheckinDayRewards::getSortOrder)
                .list());
        return Result.success(result).toJson();
    }

    /**
     * 获取我相关的签到计划列表（作为配置者或签到者）
     */
    public String listPlans(String token) {
        Users user = authService.checkToken(token);
        List<CheckinPlans> plans = checkinPlansService.lambdaQuery()
                .isNull(CheckinPlans::getDeletedAt)
                .and(w -> w.eq(CheckinPlans::getCreatorId, user.getId())
                        .or().eq(CheckinPlans::getTargetUserId, user.getId()))
                .orderByDesc(CheckinPlans::getCreatedAt)
                .list();
        return Result.success(plans).toJson();
    }

    /**
     * 获取我发布的签到计划（作为配置者）
     */
    public String listMyCreatedPlans(String token) {
        Users user = authService.checkToken(token);
        List<CheckinPlans> plans = checkinPlansService.lambdaQuery()
                .isNull(CheckinPlans::getDeletedAt)
                .eq(CheckinPlans::getCreatorId, user.getId())
                .orderByDesc(CheckinPlans::getCreatedAt)
                .list();

        List<Map<String, Object>> result = new ArrayList<>();
        for (CheckinPlans plan : plans) {
            Map<String, Object> item = new HashMap<>();
            item.put("plan", plan);
            item.put("dayRewards", checkinDayRewardsService.lambdaQuery()
                    .eq(CheckinDayRewards::getPlanId, plan.getId())
                    .orderByAsc(CheckinDayRewards::getDayNumber)
                    .orderByAsc(CheckinDayRewards::getSortOrder)
                    .list());
            result.add(item);
        }
        return Result.success(result).toJson();
    }

    /**
     * 获取我需要签到的计划列表（作为签到者）
     */
    public String listMyTargetPlans(String token) {
        Users user = authService.checkToken(token);
        List<CheckinPlans> plans = checkinPlansService.lambdaQuery()
                .isNull(CheckinPlans::getDeletedAt)
                .eq(CheckinPlans::getTargetUserId, user.getId())
                .eq(CheckinPlans::getStatus, STATUS_ACTIVE)
                .orderByDesc(CheckinPlans::getCreatedAt)
                .list();

        LocalDate today = LocalDate.now();
        List<Map<String, Object>> result = new ArrayList<>();
        for (CheckinPlans plan : plans) {
            Map<String, Object> item = new HashMap<>();
            item.put("plan", plan);
            item.put("dayRewards", checkinDayRewardsService.lambdaQuery()
                    .eq(CheckinDayRewards::getPlanId, plan.getId())
                    .orderByAsc(CheckinDayRewards::getDayNumber)
                    .orderByAsc(CheckinDayRewards::getSortOrder)
                    .list());
            item.put("status", buildCheckinStatus(plan, user.getId(), today));
            result.add(item);
        }
        return Result.success(result).toJson();
    }

    /**
     * 获取计划详情（含每日奖励）
     */
    public String getPlanDetail(String token, String planId) {
        Users user = authService.checkToken(token);
        CheckinPlans plan = checkinPlansService.getById(planId);
        if (plan == null || plan.getDeletedAt() != null) {
            return Result.fail("计划不存在").toJson();
        }
        if (!user.getId().equals(plan.getCreatorId()) && !user.getId().equals(plan.getTargetUserId())) {
            return Result.fail("无权查看该计划").toJson();
        }

        List<CheckinDayRewards> dayRewards = checkinDayRewardsService.lambdaQuery()
                .eq(CheckinDayRewards::getPlanId, planId)
                .orderByAsc(CheckinDayRewards::getDayNumber)
                .orderByAsc(CheckinDayRewards::getSortOrder)
                .list();

        Map<String, Object> result = new HashMap<>();
        result.put("plan", plan);
        result.put("dayRewards", dayRewards);
        return Result.success(result).toJson();
    }

    /**
     * 软删除签到计划
     */
    @Transactional(rollbackFor = Exception.class)
    public String deletePlan(String token, String planId) {
        Users user = authService.checkToken(token);
        CheckinPlans plan = checkinPlansService.getById(planId);
        if (plan == null || plan.getDeletedAt() != null) {
            return Result.fail("计划不存在").toJson();
        }
        if (!user.getId().equals(plan.getCreatorId())) {
            return Result.fail("无权删除该计划").toJson();
        }
        plan.setDeletedAt(new Date());
        plan.setUpdatedAt(new Date());
        checkinPlansService.updateById(plan);
        return Result.success().toJson();
    }

    /**
     * 启用/停用签到计划
     */
    public String updatePlanStatus(String token, String planId, CheckinPlanStatusDTO dto) {
        Users user = authService.checkToken(token);
        CheckinPlans plan = checkinPlansService.getById(planId);
        if (plan == null || plan.getDeletedAt() != null) {
            return Result.fail("计划不存在").toJson();
        }
        if (!user.getId().equals(plan.getCreatorId())) {
            return Result.fail("无权操作该计划").toJson();
        }
        if (!STATUS_ACTIVE.equals(dto.getStatus()) && !STATUS_INACTIVE.equals(dto.getStatus())) {
            return Result.fail("状态值无效").toJson();
        }
        plan.setStatus(dto.getStatus());
        plan.setUpdatedAt(new Date());
        checkinPlansService.updateById(plan);
        return Result.success(plan).toJson();
    }

    // ==================== 签到操作 ====================

    /**
     * 执行签到
     */
    @Transactional(rollbackFor = Exception.class)
    public String performCheckin(String token, String planId) {
        Users user = authService.checkToken(token);
        CheckinPlans plan = checkinPlansService.getById(planId);

        if (plan == null || plan.getDeletedAt() != null) {
            return Result.fail("计划不存在").toJson();
        }
        if (!user.getId().equals(plan.getTargetUserId())) {
            return Result.fail("你不是该计划的签到者").toJson();
        }
        if (!STATUS_ACTIVE.equals(plan.getStatus())) {
            return Result.fail("该计划已停用").toJson();
        }

        // 时间窗口校验
        if (!isWithinTimeWindow(plan.getTimeWindows())) {
            return Result.fail("当前不在可签到时间段内").toJson();
        }

        LocalDate today = LocalDate.now();
        Date todayDate = Date.from(today.atStartOfDay(ZoneId.systemDefault()).toInstant());

        // 防重复签到
        boolean alreadyCheckedIn = checkinRecordsService.lambdaQuery()
                .eq(CheckinRecords::getPlanId, planId)
                .eq(CheckinRecords::getUserId, user.getId())
                .eq(CheckinRecords::getCheckinDate, todayDate)
                .exists();
        if (alreadyCheckedIn) {
            return Result.fail("今日已签到").toJson();
        }

        // 获取最近一次签到记录
        CheckinRecords lastRecord = checkinRecordsService.lambdaQuery()
                .eq(CheckinRecords::getPlanId, planId)
                .eq(CheckinRecords::getUserId, user.getId())
                .orderByDesc(CheckinRecords::getCheckinDate)
                .last("LIMIT 1")
                .one();

        // 计算 dayNumber / cycle / streak
        int dayNumber;
        int cycle;
        int streak;
        LocalDate yesterday = today.minusDays(1);

        if (plan.getIsConsecutive() != null && plan.getIsConsecutive() == 1) {
            // 连续模式：基于签到进度推进
            if (lastRecord == null) {
                dayNumber = 1;
                cycle = 1;
                streak = 1;
            } else {
                LocalDate lastDate = lastRecord.getCheckinDate().toInstant()
                        .atZone(ZoneId.systemDefault()).toLocalDate();
                boolean wasYesterday = lastDate.equals(yesterday);
                if (wasYesterday) {
                    int nextDay = lastRecord.getDayNumber() + 1;
                    if (nextDay > plan.getCycleDays()) {
                        dayNumber = 1;
                        cycle = lastRecord.getCycleNumber() + 1;
                    } else {
                        dayNumber = nextDay;
                        cycle = lastRecord.getCycleNumber();
                    }
                    streak = lastRecord.getStreakCount() + 1;
                } else {
                    dayNumber = 1;
                    streak = 1;
                    cycle = lastRecord.getCycleNumber();
                }
            }
        } else {
            // 非连续模式：基于日历日期确定 dayNumber
            dayNumber = resolveCalendarDayNumber(plan, today);
            if (lastRecord == null) {
                cycle = 1;
                streak = 1;
            } else {
                LocalDate lastDate = lastRecord.getCheckinDate().toInstant()
                        .atZone(ZoneId.systemDefault()).toLocalDate();
                boolean wasYesterday = lastDate.equals(yesterday);
                streak = wasYesterday ? lastRecord.getStreakCount() + 1 : 1;
                // 日历日 wrap 回去说明进入了新周期
                if (dayNumber <= lastRecord.getDayNumber() && lastDate.toEpochDay() != today.toEpochDay()) {
                    cycle = lastRecord.getCycleNumber() + 1;
                } else {
                    cycle = lastRecord.getCycleNumber();
                }
            }
        }

        // 查询该天的奖励
        List<CheckinDayRewards> rewards = checkinDayRewardsService.lambdaQuery()
                .eq(CheckinDayRewards::getPlanId, planId)
                .eq(CheckinDayRewards::getDayNumber, dayNumber)
                .orderByAsc(CheckinDayRewards::getSortOrder)
                .list();

        // 发放奖励
        Date now = new Date();
        for (CheckinDayRewards reward : rewards) {
            if ("points".equals(reward.getRewardType()) && reward.getRewardAmount() > 0) {
                usersService.lambdaUpdate()
                        .eq(Users::getId, user.getId())
                        .setSql("points = points + " + reward.getRewardAmount())
                        .update();

                PointTransactions pt = new PointTransactions();
                pt.setUserId(user.getId());
                pt.setAmount(reward.getRewardAmount());
                pt.setTransactionType("checkin_reward");
                pt.setReferenceId(planId);
                pt.setDescription("签到奖励：" + plan.getName() + " 第" + dayNumber + "天");
                pt.setCreatedAt(now);
                pointTransactionsService.save(pt);
            } else if ("wild_card".equals(reward.getRewardType()) && reward.getRewardAmount() > 0) {
                usersService.lambdaUpdate()
                        .eq(Users::getId, user.getId())
                        .setSql("cards = cards + " + reward.getRewardAmount())
                        .update();

                CardTransactions ct = new CardTransactions();
                ct.setUserId(user.getId());
                ct.setAmount(reward.getRewardAmount());
                ct.setTransactionType("checkin_reward");
                ct.setReferenceId(planId);
                ct.setDescription("签到奖励：" + plan.getName() + " 第" + dayNumber + "天");
                ct.setCreatedAt(now);
                cardTransactionsService.save(ct);
            }
            // prop 类型：自定义道具，签到记录本身即为领取凭证
        }

        // 写入签到记录
        CheckinRecords record = CheckinRecords.builder()
                .planId(planId)
                .userId(user.getId())
                .checkinDate(todayDate)
                .dayNumber(dayNumber)
                .cycleNumber(cycle)
                .streakCount(streak)
                .checkinAt(now)
                .build();
        checkinRecordsService.save(record);

        Map<String, Object> result = new HashMap<>();
        result.put("record", record);
        result.put("rewards", rewards);
        result.put("dayNumber", dayNumber);
        result.put("streak", streak);
        result.put("cycle", cycle);
        return Result.success(result).toJson();
    }

    /**
     * 获取签到状态
     */
    public String getCheckinStatus(String token, String planId) {
        Users user = authService.checkToken(token);
        CheckinPlans plan = checkinPlansService.getById(planId);
        if (plan == null || plan.getDeletedAt() != null) {
            return Result.fail("计划不存在").toJson();
        }
        if (!user.getId().equals(plan.getTargetUserId()) && !user.getId().equals(plan.getCreatorId())) {
            return Result.fail("无权查看").toJson();
        }

        String targetUserId = plan.getTargetUserId();
        LocalDate today = LocalDate.now();
        Map<String, Object> status = buildCheckinStatus(plan, targetUserId, today);
        return Result.success(status).toJson();
    }

    /**
     * 获取签到日历数据
     */
    public String getCheckinCalendar(String token, String planId, Integer year, Integer month) {
        Users user = authService.checkToken(token);
        CheckinPlans plan = checkinPlansService.getById(planId);
        if (plan == null || plan.getDeletedAt() != null) {
            return Result.fail("计划不存在").toJson();
        }
        if (!user.getId().equals(plan.getTargetUserId()) && !user.getId().equals(plan.getCreatorId())) {
            return Result.fail("无权查看").toJson();
        }

        int y = year != null ? year : LocalDate.now().getYear();
        int m = month != null ? month : LocalDate.now().getMonthValue();
        LocalDate startDate = LocalDate.of(y, m, 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);

        Date start = Date.from(startDate.atStartOfDay(ZoneId.systemDefault()).toInstant());
        Date end = Date.from(endDate.atStartOfDay(ZoneId.systemDefault()).toInstant());

        List<CheckinRecords> records = checkinRecordsService.lambdaQuery()
                .eq(CheckinRecords::getPlanId, planId)
                .eq(CheckinRecords::getUserId, plan.getTargetUserId())
                .ge(CheckinRecords::getCheckinDate, start)
                .le(CheckinRecords::getCheckinDate, end)
                .orderByAsc(CheckinRecords::getCheckinDate)
                .list();

        Map<String, Object> result = new HashMap<>();
        result.put("records", records);
        result.put("year", y);
        result.put("month", m);
        return Result.success(result).toJson();
    }

    // ==================== 私有工具方法 ====================

    /**
     * 非连续模式下，根据日历日期计算 dayNumber。
     * monthly: dayOfMonth（上限 cycleDays）；weekly: dayOfWeek（Mon=1 … Sun=7）
     */
    private int resolveCalendarDayNumber(CheckinPlans plan, LocalDate date) {
        if (CYCLE_WEEKLY.equals(plan.getCycleType())) {
            return date.getDayOfWeek().getValue(); // Mon=1, Sun=7
        }
        return Math.min(date.getDayOfMonth(), plan.getCycleDays());
    }

    /**
     * 批量保存每日奖励配置
     */
    private void saveDayRewards(String planId, List<CheckinPlanDTO.DayRewardItem> dayRewards) {
        List<CheckinDayRewards> entities = new ArrayList<>();
        int sortOrder = 0;
        for (CheckinPlanDTO.DayRewardItem item : dayRewards) {
            if (item.getDayNumber() == null || StrUtil.isBlank(item.getRewardType())) {
                continue;
            }
            entities.add(CheckinDayRewards.builder()
                    .id(UUID.randomUUID().toString())
                    .planId(planId)
                    .dayNumber(item.getDayNumber())
                    .rewardType(item.getRewardType())
                    .rewardName(item.getRewardName())
                    .rewardAmount(item.getRewardAmount() != null ? item.getRewardAmount() : 1)
                    .description(item.getDescription())
                    .icon(item.getIcon())
                    .color(item.getColor())
                    .sortOrder(sortOrder++)
                    .build());
        }
        if (CollUtil.isNotEmpty(entities)) {
            checkinDayRewardsService.saveBatch(entities);
        }
    }

    /**
     * 判断当前时间是否在时间窗口内
     */
    private boolean isWithinTimeWindow(Object timeWindowsObj) {
        if (timeWindowsObj == null) {
            return true;
        }
        String json = timeWindowsObj.toString();
        if (StrUtil.isBlank(json) || "null".equals(json)) {
            return true;
        }
        try {
            List<CheckinPlanDTO.TimeWindow> windows = JSON.parseArray(json, CheckinPlanDTO.TimeWindow.class);
            if (CollUtil.isEmpty(windows)) {
                return true;
            }
            LocalTime now = LocalTime.now();
            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("HH:mm");
            for (CheckinPlanDTO.TimeWindow w : windows) {
                if (StrUtil.isBlank(w.getStart()) || StrUtil.isBlank(w.getEnd())) {
                    continue;
                }
                LocalTime start = LocalTime.parse(w.getStart(), fmt);
                LocalTime end = LocalTime.parse(w.getEnd(), fmt);
                if (!now.isBefore(start) && !now.isAfter(end)) {
                    return true;
                }
            }
            return false;
        } catch (Exception e) {
            log.warn("解析时间窗口失败：{}", json, e);
            return true;
        }
    }

    /**
     * 构建签到状态信息
     */
    private Map<String, Object> buildCheckinStatus(CheckinPlans plan, String userId, LocalDate today) {
        Date todayDate = Date.from(today.atStartOfDay(ZoneId.systemDefault()).toInstant());
        Map<String, Object> status = new HashMap<>();

        // 今日是否已签
        CheckinRecords todayRecord = checkinRecordsService.lambdaQuery()
                .eq(CheckinRecords::getPlanId, plan.getId())
                .eq(CheckinRecords::getUserId, userId)
                .eq(CheckinRecords::getCheckinDate, todayDate)
                .one();
        status.put("checkedInToday", todayRecord != null);
        status.put("todayRecord", todayRecord);

        // 最近一次签到
        CheckinRecords lastRecord = checkinRecordsService.lambdaQuery()
                .eq(CheckinRecords::getPlanId, plan.getId())
                .eq(CheckinRecords::getUserId, userId)
                .orderByDesc(CheckinRecords::getCheckinDate)
                .last("LIMIT 1")
                .one();

        // 计算当前应签的 dayNumber
        int currentDayNumber = 1;
        int currentStreak = 0;
        if (todayRecord != null) {
            currentDayNumber = todayRecord.getDayNumber();
            currentStreak = todayRecord.getStreakCount();
        } else if (plan.getIsConsecutive() != null && plan.getIsConsecutive() == 1) {
            // 连续模式：基于签到进度
            if (lastRecord != null) {
                LocalDate lastDate = lastRecord.getCheckinDate().toInstant()
                        .atZone(ZoneId.systemDefault()).toLocalDate();
                boolean wasYesterday = lastDate.equals(today.minusDays(1));
                if (wasYesterday) {
                    int nextDay = lastRecord.getDayNumber() + 1;
                    currentDayNumber = nextDay > plan.getCycleDays() ? 1 : nextDay;
                    currentStreak = lastRecord.getStreakCount();
                } else {
                    currentDayNumber = 1;
                    currentStreak = 0;
                }
            }
        } else {
            // 非连续模式：基于日历日期
            currentDayNumber = resolveCalendarDayNumber(plan, today);
            if (lastRecord != null) {
                LocalDate lastDate = lastRecord.getCheckinDate().toInstant()
                        .atZone(ZoneId.systemDefault()).toLocalDate();
                currentStreak = lastDate.equals(today.minusDays(1)) ? lastRecord.getStreakCount() : 0;
            }
        }
        status.put("currentDayNumber", currentDayNumber);
        status.put("currentStreak", currentStreak);

        // 当前 dayNumber 对应的奖励
        List<CheckinDayRewards> todayRewards = checkinDayRewardsService.lambdaQuery()
                .eq(CheckinDayRewards::getPlanId, plan.getId())
                .eq(CheckinDayRewards::getDayNumber, currentDayNumber)
                .orderByAsc(CheckinDayRewards::getSortOrder)
                .list();
        status.put("todayRewards", todayRewards);

        // 时间窗口状态
        status.put("isInTimeWindow", isWithinTimeWindow(plan.getTimeWindows()));

        return status;
    }
}
