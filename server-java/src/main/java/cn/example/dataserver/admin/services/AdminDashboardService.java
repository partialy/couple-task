package cn.example.dataserver.admin.services;

import cn.example.dataserver.entity.*;
import cn.example.dataserver.service.*;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final UsersService usersService;
    private final TasksService tasksService;
    private final RewardCodesService rewardCodesService;
    private final PointTransactionsService pointTransactionsService;
    private final CardTransactionsService cardTransactionsService;
    private final FeedbacksService feedbacksService;
    private final BindMomentsService bindMomentsService;
    private final DiaryEntriesService diaryEntriesService;

    public Map<String, Object> overview() {
        Map<String, Object> data = new HashMap<>();
        long totalUsers = usersService.count();
        long activeUsers = usersService.count(new LambdaQueryWrapper<Users>().isNotNull(Users::getLastLoginAt));
        long taskPublished = tasksService.count();
        long taskCompleted = tasksService.count(new LambdaQueryWrapper<Tasks>().eq(Tasks::getStatus, "completed"));
        long rewardCodesTotal = rewardCodesService.count();
        long rewardCodesUsed = rewardCodesService.count(new LambdaQueryWrapper<RewardCodes>().eq(RewardCodes::getStatus, "used"));
        Integer pointCost = calcCost(pointTransactionsService.list(), PointTransactions::getAmount);
        Integer cardCost = calcCost(cardTransactionsService.list(), CardTransactions::getAmount);
        long pendingFeedbacks = feedbacksService.count(new LambdaQueryWrapper<Feedbacks>().eq(Feedbacks::getStatus, "pending"));
        data.put("newUsers", totalUsers);
        data.put("activeUsers", activeUsers);
        data.put("taskPublished", taskPublished);
        data.put("taskCompleted", taskCompleted);
        data.put("taskCompletionRate", taskPublished == 0 ? 0D : (double) taskCompleted / taskPublished);
        data.put("rewardCodesUsed", rewardCodesUsed);
        data.put("rewardCodeUsageRate", rewardCodesTotal == 0 ? 0D : (double) rewardCodesUsed / rewardCodesTotal);
        data.put("pointCost", pointCost);
        data.put("cardCost", cardCost);
        data.put("pendingFeedbacks", pendingFeedbacks);
        data.put("newMoments", bindMomentsService.count());
        data.put("newDiaries", diaryEntriesService.count());
        return data;
    }

    public Map<String, Object> trends() {
        List<String> buckets = new ArrayList<>();
        List<Integer> newUsers = new ArrayList<>();
        List<Integer> activeUsers = new ArrayList<>();
        List<Integer> taskPublished = new ArrayList<>();
        List<Integer> taskCompleted = new ArrayList<>();
        List<Integer> pointCost = new ArrayList<>();
        List<Integer> cardCost = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate day = LocalDate.now().minusDays(i);
            Date start = Date.from(day.atStartOfDay(ZoneId.systemDefault()).toInstant());
            Date end = Date.from(day.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant());
            buckets.add(day.toString());
            newUsers.add((int) usersService.count(new LambdaQueryWrapper<Users>().ge(Users::getCreatedAt, start).lt(Users::getCreatedAt, end)));
            activeUsers.add((int) usersService.count(new LambdaQueryWrapper<Users>().ge(Users::getLastLoginAt, start).lt(Users::getLastLoginAt, end)));
            taskPublished.add((int) tasksService.count(new LambdaQueryWrapper<Tasks>().ge(Tasks::getCreatedAt, start).lt(Tasks::getCreatedAt, end)));
            taskCompleted.add((int) tasksService.count(new LambdaQueryWrapper<Tasks>().eq(Tasks::getStatus, "completed").ge(Tasks::getUpdatedAt, start).lt(Tasks::getUpdatedAt, end)));
            pointCost.add(calcCost(pointTransactionsService.list(new LambdaQueryWrapper<PointTransactions>().ge(PointTransactions::getCreatedAt, start).lt(PointTransactions::getCreatedAt, end)), PointTransactions::getAmount));
            cardCost.add(calcCost(cardTransactionsService.list(new LambdaQueryWrapper<CardTransactions>().ge(CardTransactions::getCreatedAt, start).lt(CardTransactions::getCreatedAt, end)), CardTransactions::getAmount));
        }
        Map<String, Object> data = new HashMap<>();
        data.put("buckets", buckets);
        Map<String, Object> series = new HashMap<>();
        series.put("newUsers", newUsers);
        series.put("activeUsers", activeUsers);
        series.put("taskPublished", taskPublished);
        series.put("taskCompleted", taskCompleted);
        series.put("pointCost", pointCost);
        series.put("cardCost", cardCost);
        data.put("series", series);
        return data;
    }

    public Map<String, Object> distributions() {
        Map<String, Object> data = new HashMap<>();
        Map<String, Long> taskStatus = new HashMap<>();
        taskStatus.put("pending", tasksService.count(new LambdaQueryWrapper<Tasks>().eq(Tasks::getStatus, "pending")));
        taskStatus.put("accepted", tasksService.count(new LambdaQueryWrapper<Tasks>().eq(Tasks::getStatus, "accepted")));
        taskStatus.put("completed", tasksService.count(new LambdaQueryWrapper<Tasks>().eq(Tasks::getStatus, "completed")));
        taskStatus.put("cancelled", tasksService.count(new LambdaQueryWrapper<Tasks>().eq(Tasks::getStatus, "cancelled")));
        Map<String, Long> rewardCodeStatus = new HashMap<>();
        rewardCodeStatus.put("unused", rewardCodesService.count(new LambdaQueryWrapper<RewardCodes>().eq(RewardCodes::getStatus, "unused")));
        rewardCodeStatus.put("used", rewardCodesService.count(new LambdaQueryWrapper<RewardCodes>().eq(RewardCodes::getStatus, "used")));
        rewardCodeStatus.put("voided", rewardCodesService.count(new LambdaQueryWrapper<RewardCodes>().eq(RewardCodes::getStatus, "voided")));
        data.put("taskStatus", taskStatus);
        data.put("rewardCodeStatus", rewardCodeStatus);
        return data;
    }

    public Map<String, Object> rankings() {
        Map<String, Object> data = new HashMap<>();
        data.put("activeUsersTop", usersService.list(new LambdaQueryWrapper<Users>().orderByDesc(Users::getLastLoginAt).last("limit 10")));
        data.put("taskPublishTop", tasksService.list(new LambdaQueryWrapper<Tasks>().orderByDesc(Tasks::getCreatedAt).last("limit 10")));
        data.put("redeemTop", rewardCodesService.list(new LambdaQueryWrapper<RewardCodes>().eq(RewardCodes::getStatus, "used").orderByDesc(RewardCodes::getRedeemedAt).last("limit 10")));
        return data;
    }

    public List<Map<String, Object>> alerts() {
        List<Map<String, Object>> data = new ArrayList<>();
        long pendingFeedbacks = feedbacksService.count(new LambdaQueryWrapper<Feedbacks>().eq(Feedbacks::getStatus, "pending"));
        if (pendingFeedbacks > 10) {
            data.add(buildAlert("feedback_pending", "未处理反馈过多", "feedbacks", pendingFeedbacks));
        }
        long voidedCodes = rewardCodesService.count(new LambdaQueryWrapper<RewardCodes>().eq(RewardCodes::getStatus, "voided"));
        if (voidedCodes > 50) {
            data.add(buildAlert("reward_code_voided", "作废兑换码数量异常", "reward_codes", voidedCodes));
        }
        return data;
    }

    public List<Map<String, Object>> todos() {
        List<Map<String, Object>> data = new ArrayList<>();
        data.add(buildTodo("待审核任务", tasksService.count(new LambdaQueryWrapper<Tasks>().eq(Tasks::getStatus, "pending")), "/tasks"));
        data.add(buildTodo("待处理反馈", feedbacksService.count(new LambdaQueryWrapper<Feedbacks>().eq(Feedbacks::getStatus, "pending")), "/feedbacks"));
        data.add(buildTodo("待处理兑换码异常", rewardCodesService.count(new LambdaQueryWrapper<RewardCodes>().eq(RewardCodes::getStatus, "voided")), "/reward-codes"));
        return data;
    }

    private <T> Integer calcCost(List<T> list, java.util.function.Function<T, Integer> amountGetter) {
        int sum = 0;
        for (T item : list) {
            Integer amount = amountGetter.apply(item);
            if (amount != null && amount < 0) {
                sum += Math.abs(amount);
            }
        }
        return sum;
    }

    private Map<String, Object> buildAlert(String type, String title, String objectType, long count) {
        Map<String, Object> row = new HashMap<>();
        row.put("type", type);
        row.put("title", title);
        row.put("targetType", objectType);
        row.put("count", count);
        row.put("createdAt", new Date());
        row.put("status", "pending");
        return row;
    }

    private Map<String, Object> buildTodo(String title, long count, String path) {
        Map<String, Object> row = new HashMap<>();
        row.put("title", title);
        row.put("count", count);
        row.put("path", path);
        return row;
    }
}
