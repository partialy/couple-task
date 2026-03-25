package cn.example.dataserver.controller;

import cn.example.dataserver.dto.ScheduleDTO;
import cn.example.dataserver.services.ScheduleServiceImplements;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 日程模块
 */
@CrossOrigin
@RestController
@RequestMapping("/schedule")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleServiceImplements scheduleServiceImplements;

    /**
     * 新增日程
     */
    @PostMapping("/add")
    public String addSchedule(@RequestHeader("Authorization") String token,
                              @RequestBody ScheduleDTO dto) {
        return scheduleServiceImplements.addSchedule(token, dto);
    }

    /**
     * 更新日程
     */
    @PostMapping("/update/{id}")
    public String updateSchedule(@RequestHeader("Authorization") String token,
                                 @PathVariable String id,
                                 @RequestBody ScheduleDTO dto) {
        return scheduleServiceImplements.updateSchedule(token, id, dto);
    }

    /**
     * 软删除日程
     */
    @PostMapping("/delete/{id}")
    public String deleteSchedule(@RequestHeader("Authorization") String token,
                                 @PathVariable String id) {
        return scheduleServiceImplements.deleteSchedule(token, id);
    }

    /**
     * 按日期范围查询日程列表
     *
     * @param bindId    绑定关系ID
     * @param startDate 开始日期 yyyy-MM-dd
     * @param endDate   结束日期 yyyy-MM-dd
     */
    @GetMapping("/list")
    public String listByDateRange(@RequestHeader("Authorization") String token,
                                  @RequestParam String bindId,
                                  @RequestParam String startDate,
                                  @RequestParam String endDate) {
        return scheduleServiceImplements.listByDateRange(token, bindId, startDate, endDate);
    }

    /**
     * 查询某月有事件的日期列表（用于日历圆点标记）
     *
     * @param bindId 绑定关系ID
     * @param year   年
     * @param month  月（1-12）
     */
    @GetMapping("/monthEvents")
    public String listMonthEvents(@RequestHeader("Authorization") String token,
                                  @RequestParam String bindId,
                                  @RequestParam int year,
                                  @RequestParam int month) {
        return scheduleServiceImplements.listMonthEvents(token, bindId, year, month);
    }
}
