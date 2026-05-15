package cn.example.dataserver.services;

import cn.example.dataserver.common.Result;
import cn.example.dataserver.dto.WishAddDTO;
import cn.example.dataserver.entity.BindingRelations;
import cn.example.dataserver.entity.Users;
import cn.example.dataserver.entity.WishItems;
import cn.example.dataserver.entity.WishPickQuota;
import cn.example.dataserver.enums.BindingRelation;
import cn.example.dataserver.service.BindingRelationsService;
import cn.example.dataserver.service.WishItemsService;
import cn.example.dataserver.service.WishPickQuotaService;
import cn.hutool.core.util.StrUtil;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 心愿瓶业务
 */
@Service
@RequiredArgsConstructor
public class WishServiceImplements {

    private static final String STATUS_PENDING = "pending";
    private static final String STATUS_PICKED = "picked";
    private static final String STATUS_DONE = "done";
    private static final int MAX_CONTENT_LEN = 500;

    private final AuthService authService;
    private final BindingRelationsService bindingRelationsService;
    private final WishItemsService wishItemsService;
    private final WishPickQuotaService wishPickQuotaService;

    private BindingRelations requireBind(String userId, String bindId) {
        if (StrUtil.isBlank(bindId)) {
            return null;
        }
        BindingRelations br = bindingRelationsService.getById(bindId);
        if (br == null || !BindingRelation.ACCEPTED.getValue().equals(br.getStatus())) {
            return null;
        }
        if (!userId.equals(br.getUserId()) && !userId.equals(br.getTargetId())) {
            return null;
        }
        return br;
    }

    private String partnerId(BindingRelations br, String me) {
        return me.equals(br.getUserId()) ? br.getTargetId() : br.getUserId();
    }

    private WishPickQuota getOrCreateQuota(String bindId, String userId) {
        WishPickQuota row = wishPickQuotaService.lambdaQuery()
                .eq(WishPickQuota::getBindId, bindId)
                .eq(WishPickQuota::getUserId, userId)
                .one();
        if (row == null) {
            row = new WishPickQuota();
            row.setId(UUID.randomUUID().toString());
            row.setBindId(bindId);
            row.setUserId(userId);
            row.setPickChances(0);
            row.setUpdatedAt(new Date());
            wishPickQuotaService.save(row);
        }
        return row;
    }

    private void changePickChances(String bindId, String userId, int delta) {
        WishPickQuota row = getOrCreateQuota(bindId, userId);
        int cur = row.getPickChances() == null ? 0 : row.getPickChances();
        row.setPickChances(Math.max(0, cur + delta));
        row.setUpdatedAt(new Date());
        wishPickQuotaService.updateById(row);
    }

    /**
     * 摘取次数汇总
     */
    public String summary(String token, String bindId) {
        Users user = authService.checkToken(token);
        BindingRelations bind = requireBind(user.getId(), bindId);
        if (bind == null) {
            return Result.fail("绑定关系无效").toJson();
        }
        WishPickQuota mine = getOrCreateQuota(bindId, user.getId());
        WishPickQuota partner = getOrCreateQuota(bindId, partnerId(bind, user.getId()));
        Map<String, Object> data = new HashMap<>(4);
        data.put("myPickChances", mine.getPickChances() == null ? 0 : mine.getPickChances());
        data.put("partnerPickChances", partner.getPickChances() == null ? 0 : partner.getPickChances());
        return Result.success(data).toJson();
    }

    /**
     * 我发布的心愿（记录页）
     */
    public String listMine(String token, String bindId, String includeHiddenRaw) {
        Users user = authService.checkToken(token);
        BindingRelations bind = requireBind(user.getId(), bindId);
        if (bind == null) {
            return Result.fail("绑定关系无效").toJson();
        }
        boolean includeHidden = "1".equals(includeHiddenRaw) || Boolean.parseBoolean(includeHiddenRaw);
        var chain = wishItemsService.lambdaQuery()
                .eq(WishItems::getBindId, bindId)
                .eq(WishItems::getPublisherUserId, user.getId())
                .isNull(WishItems::getDeletedAt);
        if (!includeHidden) {
            chain.isNull(WishItems::getRecordHiddenAt);
        }
        List<WishItems> list = chain.orderByDesc(WishItems::getCreatedAt).list();
        return Result.success(list).toJson();
    }

    /**
     * 对方池中待摘取（瓶中展示）
     */
    public String listPartnerPending(String token, String bindId) {
        Users user = authService.checkToken(token);
        BindingRelations bind = requireBind(user.getId(), bindId);
        if (bind == null) {
            return Result.fail("绑定关系无效").toJson();
        }
        String partner = partnerId(bind, user.getId());
        List<WishItems> list = wishItemsService.lambdaQuery()
                .eq(WishItems::getBindId, bindId)
                .eq(WishItems::getPublisherUserId, partner)
                .eq(WishItems::getPickableByUserId, user.getId())
                .eq(WishItems::getStatus, STATUS_PENDING)
                .isNull(WishItems::getDeletedAt)
                .orderByDesc(WishItems::getCreatedAt)
                .list();
        return Result.success(list).toJson();
    }

    /**
     * 许下心愿
     */
    @Transactional(rollbackFor = Exception.class)
    public String add(String token, WishAddDTO dto) {
        Users user = authService.checkToken(token);
        if (dto == null || StrUtil.isBlank(dto.getBindId())) {
            return Result.fail("bindId 不能为空").toJson();
        }
        BindingRelations bind = requireBind(user.getId(), dto.getBindId());
        if (bind == null) {
            return Result.fail("绑定关系无效").toJson();
        }
        String content = StrUtil.isBlank(dto.getContent()) ? "" : dto.getContent().trim();
        if (content.isEmpty()) {
            return Result.fail("心愿内容不能为空").toJson();
        }
        if (content.length() > MAX_CONTENT_LEN) {
            return Result.fail("心愿不能超过" + MAX_CONTENT_LEN + "字").toJson();
        }
        String colorKey = StrUtil.isBlank(dto.getColorKey()) ? "rose400" : dto.getColorKey().trim();
        if (colorKey.length() > 64) {
            return Result.fail("颜色标识过长").toJson();
        }
        String partner = partnerId(bind, user.getId());
        int bottleSide = user.getId().equals(bind.getUserId()) ? 1 : 2;
        Date now = new Date();
        WishItems row = new WishItems();
        row.setId(UUID.randomUUID().toString());
        row.setBindId(bind.getId());
        row.setPublisherUserId(user.getId());
        row.setPickableByUserId(partner);
        row.setContent(content);
        row.setColorKey(colorKey);
        row.setBottleSide(bottleSide);
        row.setPickedTimes(0);
        row.setStatus(STATUS_PENDING);
        row.setCreatedAt(now);
        row.setUpdatedAt(now);
        wishItemsService.save(row);
        changePickChances(bind.getId(), partner, 1);
        return Result.success("已许下心愿", row).toJson();
    }

    /**
     * 摘取一条对方心愿
     */
    @Transactional(rollbackFor = Exception.class)
    public String pick(String token, String bindId) {
        Users user = authService.checkToken(token);
        BindingRelations bind = requireBind(user.getId(), bindId);
        if (bind == null) {
            return Result.fail("绑定关系无效").toJson();
        }
        WishPickQuota quota = getOrCreateQuota(bindId, user.getId());
        int chances = quota.getPickChances() == null ? 0 : quota.getPickChances();
        if (chances <= 0) {
            return Result.fail("摘取次数不足").toJson();
        }
        String partner = partnerId(bind, user.getId());
        List<WishItems> pool = wishItemsService.lambdaQuery()
                .eq(WishItems::getBindId, bindId)
                .eq(WishItems::getPublisherUserId, partner)
                .eq(WishItems::getPickableByUserId, user.getId())
                .eq(WishItems::getStatus, STATUS_PENDING)
                .isNull(WishItems::getDeletedAt)
                .list();
        if (pool.isEmpty()) {
            return Result.fail("暂无可摘取的心愿").toJson();
        }
        Collections.shuffle(pool);
        WishItems w = pool.get(0);
        Date now = new Date();
        w.setStatus(STATUS_PICKED);
        w.setLastPickedByUserId(user.getId());
        w.setLastPickedAt(now);
        int pt = w.getPickedTimes() == null ? 0 : w.getPickedTimes();
        w.setPickedTimes(pt + 1);
        w.setUpdatedAt(now);
        wishItemsService.updateById(w);
        changePickChances(bindId, user.getId(), -1);
        return Result.success(w).toJson();
    }

    /**
     * 收下心愿
     */
    @Transactional(rollbackFor = Exception.class)
    public String keep(String token, String id) {
        Users user = authService.checkToken(token);
        WishItems w = wishItemsService.getById(id);
        if (w == null || w.getDeletedAt() != null) {
            return Result.fail("心愿不存在").toJson();
        }
        BindingRelations bind = requireBind(user.getId(), w.getBindId());
        if (bind == null) {
            return Result.fail("无权操作").toJson();
        }
        if (!STATUS_PICKED.equals(w.getStatus())) {
            return Result.fail("当前状态不可收下").toJson();
        }
        if (!user.getId().equals(w.getLastPickedByUserId())) {
            return Result.fail("仅摘取者可收下").toJson();
        }
        Date now = new Date();
        w.setStatus(STATUS_DONE);
        w.setFulfilledAt(now);
        w.setUpdatedAt(now);
        wishItemsService.updateById(w);
        return Result.success("已收下心愿", w).toJson();
    }

    /**
     * 放回瓶中（不返还摘取次数）
     */
    @Transactional(rollbackFor = Exception.class)
    public String putBack(String token, String id) {
        Users user = authService.checkToken(token);
        WishItems w = wishItemsService.getById(id);
        if (w == null || w.getDeletedAt() != null) {
            return Result.fail("心愿不存在").toJson();
        }
        BindingRelations bind = requireBind(user.getId(), w.getBindId());
        if (bind == null) {
            return Result.fail("无权操作").toJson();
        }
        if (!STATUS_PICKED.equals(w.getStatus())) {
            return Result.fail("当前状态不可放回").toJson();
        }
        if (!user.getId().equals(w.getLastPickedByUserId())) {
            return Result.fail("仅摘取者可放回").toJson();
        }
        Date now = new Date();
        wishItemsService.lambdaUpdate()
                .eq(WishItems::getId, w.getId())
                .set(WishItems::getStatus, STATUS_PENDING)
                .set(WishItems::getLastPickedByUserId, null)
                .set(WishItems::getLastPickedAt, null)
                .set(WishItems::getUpdatedAt, now)
                .update();
        w.setStatus(STATUS_PENDING);
        w.setLastPickedByUserId(null);
        w.setLastPickedAt(null);
        w.setUpdatedAt(now);
        return Result.success("已放回瓶中", w).toJson();
    }

    /**
     * 软删除（仅发布者）
     */
    public String deleteWish(String token, String id) {
        Users user = authService.checkToken(token);
        WishItems w = wishItemsService.getById(id);
        if (w == null || w.getDeletedAt() != null) {
            return Result.fail("心愿不存在").toJson();
        }
        if (!user.getId().equals(w.getPublisherUserId())) {
            return Result.fail("仅能删除自己发布的心愿").toJson();
        }
        if (STATUS_PICKED.equals(w.getStatus())) {
            return Result.fail("心愿正被摘取中，请先放回或收下后再删除").toJson();
        }
        Date now = new Date();
        w.setDeletedAt(now);
        w.setUpdatedAt(now);
        wishItemsService.updateById(w);
        return Result.success("已删除").toJson();
    }

    /**
     * 在记录列表中隐藏（不影响对方摘取）
     */
    public String hideRecord(String token, String id) {
        Users user = authService.checkToken(token);
        WishItems w = wishItemsService.getById(id);
        if (w == null || w.getDeletedAt() != null) {
            return Result.fail("心愿不存在").toJson();
        }
        if (!user.getId().equals(w.getPublisherUserId())) {
            return Result.fail("无权操作").toJson();
        }
        w.setRecordHiddenAt(new Date());
        w.setUpdatedAt(new Date());
        wishItemsService.updateById(w);
        return Result.success("已隐藏").toJson();
    }

    /**
     * 取消记录页隐藏
     */
    public String unhideRecord(String token, String id) {
        Users user = authService.checkToken(token);
        WishItems w = wishItemsService.getById(id);
        if (w == null || w.getDeletedAt() != null) {
            return Result.fail("心愿不存在").toJson();
        }
        if (!user.getId().equals(w.getPublisherUserId())) {
            return Result.fail("无权操作").toJson();
        }
        // updateById 会忽略 null 字段，无法把 record_hidden_at 置空，必须用 lambdaUpdate
        wishItemsService.lambdaUpdate()
                .eq(WishItems::getId, id)
                .set(WishItems::getRecordHiddenAt, null)
                .set(WishItems::getUpdatedAt, new Date())
                .update();
        return Result.success("已取消隐藏").toJson();
    }
}
