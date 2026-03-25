package cn.example.dataserver.services;

import cn.example.dataserver.common.BusinessException;
import cn.example.dataserver.common.Result;
import cn.example.dataserver.dto.ScheduleDTO;
import cn.example.dataserver.entity.BindingRelations;
import cn.example.dataserver.entity.Schedules;
import cn.example.dataserver.entity.Users;
import cn.example.dataserver.enums.BindingRelation;
import cn.example.dataserver.service.BindingRelationsService;
import cn.example.dataserver.service.SchedulesService;
import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.util.StrUtil;
import com.alibaba.fastjson2.JSON;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 日程模块核心业务逻辑
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ScheduleServiceImplements {

    private static final int MAX_TYPE_LENGTH = 20;
    private static final int MAX_IMAGES_COUNT = 3;
    private static final String DEFAULT_TYPE = "未命名日程";

    private final AuthService authService;
    private final SchedulesService schedulesService;
    private final BindingRelationsService bindingRelationsService;

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
     * 新增日程
     */
    public String addSchedule(String token, ScheduleDTO dto) {
        Users user = authService.checkToken(token);
        BindingRelations bind = resolveAcceptedBinding(user.getId());
        if (bind == null) {
            return Result.fail("请先绑定另一半").toJson();
        }

        // 校验类型名称长度
        String type = StrUtil.isBlank(dto.getType()) ? DEFAULT_TYPE : dto.getType().trim();
        if (type.length() > MAX_TYPE_LENGTH) {
            return Result.fail("日程类型名称不能超过" + MAX_TYPE_LENGTH + "个字").toJson();
        }

        // 校验图片数量
        if (CollUtil.isNotEmpty(dto.getImages()) && dto.getImages().size() > MAX_IMAGES_COUNT) {
            return Result.fail("最多上传" + MAX_IMAGES_COUNT + "张图片").toJson();
        }

        // 解析事件时间
        if (StrUtil.isBlank(dto.getEventTime())) {
            return Result.fail("事件时间不能为空").toJson();
        }
        Date eventTime = parseDateTime(dto.getEventTime());

        // 构建实体
        Schedules schedule = new Schedules();
        schedule.setId(UUID.randomUUID().toString());
        schedule.setBindId(bind.getId());
        schedule.setUserId(user.getId());
        schedule.setType(type);
        schedule.setDescription(dto.getDescription());
        schedule.setLocation(dto.getLocation());
        schedule.setImages(CollUtil.isNotEmpty(dto.getImages()) ? JSON.toJSONString(dto.getImages()) : null);
        schedule.setEventTime(eventTime);
        schedule.setEventRelationId(dto.getEventRelationId());
        schedule.setPopupRemind(dto.getPopupRemind() != null && !dto.getPopupRemind() ? 0 : 1);
        schedule.setCreatedAt(new Date());
        schedule.setUpdatedAt(new Date());

        schedulesService.save(schedule);
        return Result.success("日程已添加", schedule).toJson();
    }

    /**
     * 更新日程
     */
    public String updateSchedule(String token, String id, ScheduleDTO dto) {
        Users user = authService.checkToken(token);

        Schedules schedule = schedulesService.getById(id);
        if (schedule == null || schedule.getDeletedAt() != null) {
            return Result.fail("日程不存在").toJson();
        }

        // 校验归属：只有同一绑定关系下的用户可操作
        BindingRelations bind = resolveAcceptedBinding(user.getId());
        if (bind == null || !bind.getId().equals(schedule.getBindId())) {
            return Result.fail("无权操作此日程").toJson();
        }

        // 校验类型名称长度
        if (StrUtil.isNotBlank(dto.getType())) {
            String type = dto.getType().trim();
            if (type.length() > MAX_TYPE_LENGTH) {
                return Result.fail("日程类型名称不能超过" + MAX_TYPE_LENGTH + "个字").toJson();
            }
            schedule.setType(type);
        }

        // 校验图片数量
        if (dto.getImages() != null) {
            if (dto.getImages().size() > MAX_IMAGES_COUNT) {
                return Result.fail("最多上传" + MAX_IMAGES_COUNT + "张图片").toJson();
            }
            schedule.setImages(CollUtil.isNotEmpty(dto.getImages()) ? JSON.toJSONString(dto.getImages()) : null);
        }

        if (StrUtil.isNotBlank(dto.getEventTime())) {
            schedule.setEventTime(parseDateTime(dto.getEventTime()));
        }
        if (dto.getDescription() != null) {
            schedule.setDescription(dto.getDescription());
        }
        if (dto.getLocation() != null) {
            schedule.setLocation(dto.getLocation());
        }
        if (dto.getEventRelationId() != null) {
            schedule.setEventRelationId(dto.getEventRelationId());
        }
        if (dto.getPopupRemind() != null) {
            schedule.setPopupRemind(dto.getPopupRemind() ? 1 : 0);
        }
        schedule.setUpdatedAt(new Date());

        schedulesService.updateById(schedule);
        return Result.success("日程已更新", schedule).toJson();
    }

    /**
     * 软删除日程
     */
    public String deleteSchedule(String token, String id) {
        Users user = authService.checkToken(token);

        Schedules schedule = schedulesService.getById(id);
        if (schedule == null || schedule.getDeletedAt() != null) {
            return Result.fail("日程不存在").toJson();
        }

        BindingRelations bind = resolveAcceptedBinding(user.getId());
        if (bind == null || !bind.getId().equals(schedule.getBindId())) {
            return Result.fail("无权操作此日程").toJson();
        }

        schedule.setDeletedAt(new Date());
        schedule.setUpdatedAt(new Date());
        schedulesService.updateById(schedule);
        return Result.success("日程已删除").toJson();
    }

    /**
     * 按日期范围查询日程列表
     *
     * @param bindId    绑定关系ID
     * @param startDate 开始日期 yyyy-MM-dd
     * @param endDate   结束日期 yyyy-MM-dd
     */
    public String listByDateRange(String token, String bindId, String startDate, String endDate) {
        Users user = authService.checkToken(token);

        BindingRelations bind = resolveAcceptedBinding(user.getId());
        if (bind == null || !bind.getId().equals(bindId)) {
            return Result.fail("无权查看此绑定下的日程").toJson();
        }

        Date start = parseDate(startDate);
        Date end = parseDateEndOfDay(endDate);

        List<Schedules> list = schedulesService.lambdaQuery()
                .eq(Schedules::getBindId, bindId)
                .isNull(Schedules::getDeletedAt)
                .ge(Schedules::getEventTime, start)
                .le(Schedules::getEventTime, end)
                .orderByAsc(Schedules::getEventTime)
                .list();

        return Result.success(list).toJson();
    }

    /**
     * 查询某月有事件的日期列表（用于日历圆点标记）
     *
     * @param bindId 绑定关系ID
     * @param year   年
     * @param month  月（1-12）
     * @return 包含事件的日期列表，格式 ["2026-03-01", "2026-03-15"]
     */
    public String listMonthEvents(String token, String bindId, int year, int month) {
        Users user = authService.checkToken(token);

        BindingRelations bind = resolveAcceptedBinding(user.getId());
        if (bind == null || !bind.getId().equals(bindId)) {
            return Result.fail("无权查看此绑定下的日程").toJson();
        }

        YearMonth ym = YearMonth.of(year, month);
        LocalDate firstDay = ym.atDay(1);
        LocalDate lastDay = ym.atEndOfMonth();
        Date start = Date.from(firstDay.atStartOfDay(ZoneId.systemDefault()).toInstant());
        Date end = Date.from(lastDay.atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant());

        List<Schedules> list = schedulesService.lambdaQuery()
                .eq(Schedules::getBindId, bindId)
                .isNull(Schedules::getDeletedAt)
                .ge(Schedules::getEventTime, start)
                .le(Schedules::getEventTime, end)
                .select(Schedules::getEventTime)
                .list();

        // 提取去重的日期字符串
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        List<String> dates = list.stream()
                .map(s -> sdf.format(s.getEventTime()))
                .distinct()
                .sorted()
                .collect(Collectors.toList());

        return Result.success(dates).toJson();
    }

    // ==================== 工具方法 ====================

    /**
     * 解析日期时间字符串 yyyy-MM-dd HH:mm:ss
     */
    private Date parseDateTime(String dateTimeStr) {
        try {
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            return sdf.parse(dateTimeStr);
        } catch (ParseException e) {
            // 尝试只有日期的格式
            try {
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm");
                return sdf.parse(dateTimeStr);
            } catch (ParseException ex) {
                throw new BusinessException("日期时间格式错误，请使用 yyyy-MM-dd HH:mm:ss");
            }
        }
    }

    /**
     * 解析日期字符串为当天 00:00:00
     */
    private Date parseDate(String dateStr) {
        try {
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
            return sdf.parse(dateStr);
        } catch (ParseException e) {
            throw new BusinessException("日期格式错误，请使用 yyyy-MM-dd");
        }
    }

    /**
     * 解析日期字符串为当天 23:59:59
     */
    private Date parseDateEndOfDay(String dateStr) {
        try {
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            return sdf.parse(dateStr + " 23:59:59");
        } catch (ParseException e) {
            throw new BusinessException("日期格式错误，请使用 yyyy-MM-dd");
        }
    }
}
