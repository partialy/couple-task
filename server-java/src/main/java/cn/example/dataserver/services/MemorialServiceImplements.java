package cn.example.dataserver.services;

import cn.example.dataserver.common.BusinessException;
import cn.example.dataserver.common.Result;
import cn.example.dataserver.dto.MemorialDTO;
import cn.example.dataserver.entity.BindingRelations;
import cn.example.dataserver.entity.MemorialDays;
import cn.example.dataserver.entity.Users;
import cn.example.dataserver.enums.BindingRelation;
import cn.example.dataserver.service.BindingRelationsService;
import cn.example.dataserver.service.MemorialDaysService;
import cn.hutool.core.util.StrUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.UUID;

/**
 * 纪念日与倒数日业务逻辑
 */
@Service
@RequiredArgsConstructor
public class MemorialServiceImplements {

    private static final int KIND_COUNTDOWN = 1;
    private static final int KIND_MILESTONE = 2;
    private static final int MAX_TITLE_LENGTH = 60;
    private static final int MAX_CATEGORY_LENGTH = 60;
    private static final int MAX_PERSON_LENGTH = 60;
    private static final int MAX_ICON_KEY_LENGTH = 32;
    private static final int MAX_THEME_LENGTH = 32;
    private static final int MAX_URL_LENGTH = 512;
    private static final String EVENT_ANNIVERSARY = "anniversary";
    private static final String EVENT_BIRTHDAY = "birthday";

    private final AuthService authService;
    private final MemorialDaysService memorialDaysService;
    private final BindingRelationsService bindingRelationsService;

    /**
     * 获取当前用户已接受的绑定关系
     */
    private BindingRelations resolveAcceptedBinding(String userId) {
        return bindingRelationsService.lambdaQuery()
                .and(w -> w.eq(BindingRelations::getUserId, userId)
                        .or().eq(BindingRelations::getTargetId, userId))
                .eq(BindingRelations::getStatus, BindingRelation.ACCEPTED.getValue())
                .one();
    }

    /**
     * 取消同绑定下其他条目的置顶
     *
     * @param bindId   绑定ID
     * @param exceptId 保留置顶的条目 ID，可为空表示全部取消
     */
    private void clearOtherPins(String bindId, String exceptId) {
        var chain = memorialDaysService.lambdaUpdate()
                .eq(MemorialDays::getBindId, bindId)
                .isNull(MemorialDays::getDeletedAt)
                .set(MemorialDays::getIsPinned, 0);
        if (StrUtil.isNotBlank(exceptId)) {
            chain.ne(MemorialDays::getId, exceptId);
        }
        chain.update();
    }

    /**
     * 解析事件类型字符串
     */
    private String normalizeEventType(MemorialDTO dto) {
        if (StrUtil.isNotBlank(dto.getEventType())) {
            String t = dto.getEventType().trim().toLowerCase();
            if (EVENT_ANNIVERSARY.equals(t) || EVENT_BIRTHDAY.equals(t)) {
                return t;
            }
            return null;
        }
        if (dto.getKind() != null && dto.getKind() == KIND_MILESTONE) {
            return EVENT_ANNIVERSARY;
        }
        return EVENT_ANNIVERSARY;
    }

    /**
     * 新增
     */
    public String addMemorial(String token, MemorialDTO dto) {
        Users user = authService.checkToken(token);
        BindingRelations bind = resolveAcceptedBinding(user.getId());
        if (bind == null) {
            return Result.fail("请先绑定另一半").toJson();
        }

        String eventType = normalizeEventType(dto);
        if (eventType == null) {
            return Result.fail("事件类型无效，请使用 anniversary 或 birthday").toJson();
        }

        if (dto.getKind() != null && dto.getKind() != KIND_COUNTDOWN && dto.getKind() != KIND_MILESTONE) {
            return Result.fail("类型无效，请使用 1=倒数日 或 2=纪念日").toJson();
        }

        String title = StrUtil.isBlank(dto.getTitle()) ? "未命名" : dto.getTitle().trim();
        if (title.length() > MAX_TITLE_LENGTH) {
            return Result.fail("标题不能超过" + MAX_TITLE_LENGTH + "个字符").toJson();
        }

        if (StrUtil.isBlank(dto.getAnchorDate())) {
            return Result.fail("日期不能为空").toJson();
        }
        Date anchor = parseDateOnly(dto.getAnchorDate());

        int repeat = 0;
        if (EVENT_BIRTHDAY.equals(eventType)) {
            repeat = 1;
        } else if (dto.getKind() != null && dto.getKind() == KIND_COUNTDOWN) {
            repeat = Boolean.TRUE.equals(dto.getRepeatYearly()) ? 1 : 0;
        } else {
            repeat = Boolean.TRUE.equals(dto.getRepeatYearly()) ? 1 : 0;
        }

        int kindVal = dto.getKind() != null ? dto.getKind() : KIND_COUNTDOWN;

        String iconKey = StrUtil.isBlank(dto.getIconKey()) ? "love" : dto.getIconKey().trim();
        if (iconKey.length() > MAX_ICON_KEY_LENGTH) {
            return Result.fail("图标标识过长").toJson();
        }
        String colorThemeId = StrUtil.isBlank(dto.getColorThemeId()) ? "rose" : dto.getColorThemeId().trim();
        if (colorThemeId.length() > MAX_THEME_LENGTH) {
            return Result.fail("主题标识过长").toJson();
        }
        String customCategory = StrUtil.isBlank(dto.getCustomCategory()) ? "纪念日" : dto.getCustomCategory().trim();
        if (customCategory.length() > MAX_CATEGORY_LENGTH) {
            return Result.fail("分类名称过长").toJson();
        }
        String personName = StrUtil.isBlank(dto.getPersonName()) ? null : dto.getPersonName().trim();
        if (personName != null && personName.length() > MAX_PERSON_LENGTH) {
            return Result.fail("姓名过长").toJson();
        }
        String customUrl = StrUtil.isBlank(dto.getCustomIconUrl()) ? null : dto.getCustomIconUrl().trim();
        if (customUrl != null && customUrl.length() > MAX_URL_LENGTH) {
            return Result.fail("图标地址过长").toJson();
        }

        int pinned = Boolean.TRUE.equals(dto.getPinned()) ? 1 : 0;
        if (pinned == 1) {
            clearOtherPins(bind.getId(), null);
        }

        MemorialDays row = new MemorialDays();
        row.setId(UUID.randomUUID().toString());
        row.setBindId(bind.getId());
        row.setUserId(user.getId());
        row.setTitle(title);
        row.setEventType(eventType);
        row.setIconKey(iconKey);
        row.setCustomIconUrl(customUrl);
        row.setColorThemeId(colorThemeId);
        row.setCustomCategory(customCategory);
        row.setPersonName(personName);
        row.setIsPinned(pinned);
        row.setKind(kindVal);
        row.setAnchorDate(anchor);
        row.setRepeatYearly(repeat);
        row.setNote(StrUtil.isBlank(dto.getNote()) ? null : dto.getNote().trim());
        row.setSortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0);
        row.setCreatedAt(new Date());
        row.setUpdatedAt(new Date());

        memorialDaysService.save(row);
        return Result.success("已添加", row).toJson();
    }

    /**
     * 更新
     */
    public String updateMemorial(String token, String id, MemorialDTO dto) {
        Users user = authService.checkToken(token);

        MemorialDays row = memorialDaysService.getById(id);
        if (row == null || row.getDeletedAt() != null) {
            return Result.fail("记录不存在").toJson();
        }

        BindingRelations bind = resolveAcceptedBinding(user.getId());
        if (bind == null || !bind.getId().equals(row.getBindId())) {
            return Result.fail("无权操作此记录").toJson();
        }

        if (dto.getEventType() != null) {
            String t = normalizeEventType(dto);
            if (t == null) {
                return Result.fail("事件类型无效").toJson();
            }
            row.setEventType(t);
        }

        if (dto.getKind() != null && dto.getKind() != KIND_COUNTDOWN && dto.getKind() != KIND_MILESTONE) {
            return Result.fail("类型无效").toJson();
        }

        if (StrUtil.isNotBlank(dto.getTitle())) {
            String title = dto.getTitle().trim();
            if (title.length() > MAX_TITLE_LENGTH) {
                return Result.fail("标题不能超过" + MAX_TITLE_LENGTH + "个字符").toJson();
            }
            row.setTitle(title);
        }

        if (dto.getKind() != null) {
            row.setKind(dto.getKind());
        }

        if (StrUtil.isNotBlank(dto.getAnchorDate())) {
            row.setAnchorDate(parseDateOnly(dto.getAnchorDate()));
        }

        String effectiveEvent = row.getEventType() != null ? row.getEventType() : EVENT_ANNIVERSARY;
        if (dto.getRepeatYearly() != null) {
            if (EVENT_BIRTHDAY.equals(effectiveEvent)) {
                row.setRepeatYearly(1);
            } else {
                row.setRepeatYearly(Boolean.TRUE.equals(dto.getRepeatYearly()) ? 1 : 0);
            }
        } else if (dto.getEventType() != null) {
            row.setRepeatYearly(EVENT_BIRTHDAY.equals(effectiveEvent) ? 1 : row.getRepeatYearly());
        }

        if (dto.getIconKey() != null) {
            String ik = StrUtil.isBlank(dto.getIconKey()) ? "love" : dto.getIconKey().trim();
            if (ik.length() > MAX_ICON_KEY_LENGTH) {
                return Result.fail("图标标识过长").toJson();
            }
            row.setIconKey(ik);
        }
        if (dto.getColorThemeId() != null) {
            String ct = StrUtil.isBlank(dto.getColorThemeId()) ? "rose" : dto.getColorThemeId().trim();
            if (ct.length() > MAX_THEME_LENGTH) {
                return Result.fail("主题标识过长").toJson();
            }
            row.setColorThemeId(ct);
        }
        if (dto.getCustomCategory() != null) {
            String cc = StrUtil.isBlank(dto.getCustomCategory()) ? "纪念日" : dto.getCustomCategory().trim();
            if (cc.length() > MAX_CATEGORY_LENGTH) {
                return Result.fail("分类名称过长").toJson();
            }
            row.setCustomCategory(cc);
        }
        if (dto.getPersonName() != null) {
            String pn = StrUtil.isBlank(dto.getPersonName()) ? null : dto.getPersonName().trim();
            if (pn != null && pn.length() > MAX_PERSON_LENGTH) {
                return Result.fail("姓名过长").toJson();
            }
            row.setPersonName(pn);
        }
        if (dto.getCustomIconUrl() != null) {
            String u = StrUtil.isBlank(dto.getCustomIconUrl()) ? null : dto.getCustomIconUrl().trim();
            if (u != null && u.length() > MAX_URL_LENGTH) {
                return Result.fail("图标地址过长").toJson();
            }
            row.setCustomIconUrl(u);
        }

        if (dto.getPinned() != null) {
            int p = Boolean.TRUE.equals(dto.getPinned()) ? 1 : 0;
            if (p == 1) {
                clearOtherPins(bind.getId(), id);
            }
            row.setIsPinned(p);
        }

        if (dto.getNote() != null) {
            row.setNote(StrUtil.isBlank(dto.getNote()) ? null : dto.getNote().trim());
        }
        if (dto.getSortOrder() != null) {
            row.setSortOrder(dto.getSortOrder());
        }

        row.setUpdatedAt(new Date());
        memorialDaysService.updateById(row);
        return Result.success("已更新", row).toJson();
    }

    /**
     * 软删除
     */
    public String deleteMemorial(String token, String id) {
        Users user = authService.checkToken(token);

        MemorialDays row = memorialDaysService.getById(id);
        if (row == null || row.getDeletedAt() != null) {
            return Result.fail("记录不存在").toJson();
        }

        BindingRelations bind = resolveAcceptedBinding(user.getId());
        if (bind == null || !bind.getId().equals(row.getBindId())) {
            return Result.fail("无权操作此记录").toJson();
        }

        row.setDeletedAt(new Date());
        row.setUpdatedAt(new Date());
        memorialDaysService.updateById(row);
        return Result.success("已删除").toJson();
    }

    /**
     * 按绑定关系查询列表
     */
    public String listByBindId(String token, String bindId) {
        Users user = authService.checkToken(token);

        BindingRelations bind = resolveAcceptedBinding(user.getId());
        if (bind == null || !bind.getId().equals(bindId)) {
            return Result.fail("无权查看此绑定下的数据").toJson();
        }

        var list = memorialDaysService.lambdaQuery()
                .eq(MemorialDays::getBindId, bindId)
                .isNull(MemorialDays::getDeletedAt)
                .orderByDesc(MemorialDays::getIsPinned)
                .orderByDesc(MemorialDays::getSortOrder)
                .orderByDesc(MemorialDays::getCreatedAt)
                .list();

        return Result.success(list).toJson();
    }

    /**
     * 解析 yyyy-MM-dd
     */
    private Date parseDateOnly(String dateStr) {
        try {
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
            sdf.setLenient(false);
            return sdf.parse(dateStr);
        } catch (ParseException e) {
            throw new BusinessException("日期格式错误，请使用 yyyy-MM-dd");
        }
    }
}
