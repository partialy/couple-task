package cn.example.dataserver.services;

import cn.example.dataserver.common.BusinessException;
import cn.example.dataserver.common.Result;
import cn.example.dataserver.dto.DiaryCommentDTO;
import cn.example.dataserver.dto.DiaryDTO;
import cn.example.dataserver.entity.BindingRelations;
import cn.example.dataserver.entity.DiaryEntries;
import cn.example.dataserver.entity.Users;
import cn.example.dataserver.enums.BindingRelation;
import cn.example.dataserver.service.BindingRelationsService;
import cn.example.dataserver.service.DiaryEntriesService;
import cn.hutool.core.util.StrUtil;
import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONArray;
import com.alibaba.fastjson2.JSONObject;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * 日记模块核心业务逻辑
 */
@Service
@RequiredArgsConstructor
public class DiaryServiceImplements {

    private static final int MAX_MOOD_LENGTH = 32;
    private static final int MAX_CONTENT_LENGTH = 5000;
    private static final int MAX_IMAGE_URL_LENGTH = 512;
    private static final int MAX_COMMENT_LENGTH = 500;
    private static final int MAX_COMMENT_COUNT = 100;

    private final AuthService authService;
    private final DiaryEntriesService diaryEntriesService;
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
     * 新增日记
     */
    public String addDiary(String token, DiaryDTO dto) {
        Users user = authService.checkToken(token);
        BindingRelations bind = resolveAcceptedBinding(user.getId());
        if (bind == null) {
            return Result.fail("请先绑定另一半").toJson();
        }
        if (dto == null) {
            return Result.fail("参数不能为空").toJson();
        }

        String mood = normalizeMood(dto.getMood());
        if (mood == null) {
            return Result.fail("心情不能为空且不能超过" + MAX_MOOD_LENGTH + "个字符").toJson();
        }
        String content = normalizeContent(dto.getContent());
        if (content == null) {
            return Result.fail("正文不能超过" + MAX_CONTENT_LENGTH + "个字符").toJson();
        }
        String imageUrl = normalizeImageUrl(dto.getImageUrl());
        if (imageUrl == null) {
            return Result.fail("图片地址过长").toJson();
        }
        if (StrUtil.isBlank(content) && StrUtil.isBlank(imageUrl)) {
            return Result.fail("正文和图片不能同时为空").toJson();
        }
        if (StrUtil.isBlank(dto.getEntryDate())) {
            return Result.fail("日期不能为空").toJson();
        }

        DiaryEntries row = new DiaryEntries();
        row.setId(UUID.randomUUID().toString());
        row.setBindId(bind.getId());
        row.setUserId(user.getId());
        row.setEntryDate(parseDateOnly(dto.getEntryDate()));
        row.setMood(mood);
        row.setContent(content);
        row.setImageUrl(imageUrl);
        row.setLikedByPartner(0);
        row.setAuthorJson(buildUserJson(user).toJSONString());
        row.setCommentsJson("[]");
        row.setCreatedAt(new Date());
        row.setUpdatedAt(new Date());
        diaryEntriesService.save(row);
        return Result.success("已添加", row).toJson();
    }

    /**
     * 更新日记
     */
    public String updateDiary(String token, String id, DiaryDTO dto) {
        Users user = authService.checkToken(token);
        DiaryEntries row = diaryEntriesService.getById(id);
        if (row == null || row.getDeletedAt() != null) {
            return Result.fail("记录不存在").toJson();
        }
        BindingRelations bind = resolveAcceptedBinding(user.getId());
        if (bind == null || !bind.getId().equals(row.getBindId())) {
            return Result.fail("无权操作此记录").toJson();
        }
        if (dto == null) {
            return Result.fail("参数不能为空").toJson();
        }

        if (dto.getEntryDate() != null) {
            row.setEntryDate(parseDateOnly(dto.getEntryDate()));
        }
        if (dto.getMood() != null) {
            String mood = normalizeMood(dto.getMood());
            if (mood == null) {
                return Result.fail("心情不能为空且不能超过" + MAX_MOOD_LENGTH + "个字符").toJson();
            }
            row.setMood(mood);
        }
        if (dto.getContent() != null) {
            String content = normalizeContent(dto.getContent());
            if (content == null) {
                return Result.fail("正文不能超过" + MAX_CONTENT_LENGTH + "个字符").toJson();
            }
            row.setContent(content);
        }
        if (dto.getImageUrl() != null) {
            String imageUrl = normalizeImageUrl(dto.getImageUrl());
            if (imageUrl == null) {
                return Result.fail("图片地址过长").toJson();
            }
            row.setImageUrl(imageUrl);
        }
        row.setAuthorJson(buildUserJson(user).toJSONString());
        if (StrUtil.isBlank(row.getContent()) && StrUtil.isBlank(row.getImageUrl())) {
            return Result.fail("正文和图片不能同时为空").toJson();
        }

        row.setUpdatedAt(new Date());
        diaryEntriesService.updateById(row);
        return Result.success("已更新", row).toJson();
    }

    /**
     * 删除日记
     */
    public String deleteDiary(String token, String id) {
        Users user = authService.checkToken(token);
        DiaryEntries row = diaryEntriesService.getById(id);
        if (row == null || row.getDeletedAt() != null) {
            return Result.fail("记录不存在").toJson();
        }
        BindingRelations bind = resolveAcceptedBinding(user.getId());
        if (bind == null || !bind.getId().equals(row.getBindId())) {
            return Result.fail("无权操作此记录").toJson();
        }
        row.setDeletedAt(new Date());
        row.setUpdatedAt(new Date());
        diaryEntriesService.updateById(row);
        return Result.success("已删除").toJson();
    }

    /**
     * 日记列表
     */
    public String listDiary(String token, String bindId, String entryDate) {
        Users user = authService.checkToken(token);
        BindingRelations bind = resolveAcceptedBinding(user.getId());
        if (bind == null || !bind.getId().equals(bindId)) {
            return Result.fail("无权查看此绑定下的数据").toJson();
        }

        var query = diaryEntriesService.lambdaQuery()
                .eq(DiaryEntries::getBindId, bindId)
                .isNull(DiaryEntries::getDeletedAt);
        if (StrUtil.isNotBlank(entryDate)) {
            query.eq(DiaryEntries::getEntryDate, parseDateOnly(entryDate));
        }
        List<DiaryEntries> list = query
                .orderByDesc(DiaryEntries::getEntryDate)
                .orderByDesc(DiaryEntries::getCreatedAt)
                .list();
        return Result.success(list).toJson();
    }

    /**
     * 检查今天是否写过日记（当前登录用户）
     */
    public String checkTodayWritten(String token, String bindId) {
        Users user = authService.checkToken(token);
        BindingRelations bind = resolveAcceptedBinding(user.getId());
        if (bind == null || !bind.getId().equals(bindId)) {
            return Result.fail("无权查看此绑定下的数据").toJson();
        }
        Date today = parseDateOnly(new java.text.SimpleDateFormat("yyyy-MM-dd").format(new Date()));
        boolean written = diaryEntriesService.lambdaQuery()
                .eq(DiaryEntries::getBindId, bindId)
                .eq(DiaryEntries::getUserId, user.getId())
                .eq(DiaryEntries::getEntryDate, today)
                .isNull(DiaryEntries::getDeletedAt)
                .count() > 0;
        Map<String, Object> data = new HashMap<>();
        data.put("written", written);
        return Result.success(data).toJson();
    }

    /**
     * 切换点赞状态
     */
    public String toggleLike(String token, String id) {
        Users user = authService.checkToken(token);
        DiaryEntries row = diaryEntriesService.getById(id);
        if (row == null || row.getDeletedAt() != null) {
            return Result.fail("记录不存在").toJson();
        }
        BindingRelations bind = resolveAcceptedBinding(user.getId());
        if (bind == null || !bind.getId().equals(row.getBindId())) {
            return Result.fail("无权操作此记录").toJson();
        }
        if (user.getId().equals(row.getUserId())) {
            return Result.fail("不能给自己的日记点赞").toJson();
        }

        int nextLike = row.getLikedByPartner() != null && row.getLikedByPartner() == 1 ? 0 : 1;
        row.setLikedByPartner(nextLike);
        row.setUpdatedAt(new Date());
        diaryEntriesService.updateById(row);
        return Result.success("操作成功", row).toJson();
    }

    /**
     * 新增评论（写入 comments_json）
     */
    public String addComment(String token, String id, DiaryCommentDTO dto) {
        Users user = authService.checkToken(token);
        DiaryEntries row = diaryEntriesService.getById(id);
        if (row == null || row.getDeletedAt() != null) {
            return Result.fail("记录不存在").toJson();
        }
        BindingRelations bind = resolveAcceptedBinding(user.getId());
        if (bind == null || !bind.getId().equals(row.getBindId())) {
            return Result.fail("无权操作此记录").toJson();
        }
        if (dto == null || StrUtil.isBlank(dto.getContent())) {
            return Result.fail("评论内容不能为空").toJson();
        }
        String content = dto.getContent().trim();
        if (content.length() > MAX_COMMENT_LENGTH) {
            return Result.fail("评论内容不能超过" + MAX_COMMENT_LENGTH + "个字符").toJson();
        }

        JSONArray comments = parseComments(row.getCommentsJson());
        if (comments.size() >= MAX_COMMENT_COUNT) {
            return Result.fail("评论数量已达上限").toJson();
        }

        JSONObject commentObj = new JSONObject();
        commentObj.put("id", UUID.randomUUID().toString());
        commentObj.put("userId", user.getId());
        commentObj.put("userName", user.getUsername());
        commentObj.put("nickname", StrUtil.isBlank(user.getNickname()) ? user.getUsername() : user.getNickname());
        commentObj.put("avatar", user.getAvatar());
        commentObj.put("gender", StrUtil.blankToDefault(user.getGender(), "other"));
        commentObj.put("content", content);
        commentObj.put("time", formatDateTime(new Date()));
        comments.add(commentObj);

        row.setCommentsJson(comments.toJSONString());
        row.setUpdatedAt(new Date());
        diaryEntriesService.updateById(row);
        return Result.success("评论成功", row).toJson();
    }

    /**
     * 删除自己的评论
     */
    public String deleteComment(String token, String id, String commentId) {
        Users user = authService.checkToken(token);
        DiaryEntries row = diaryEntriesService.getById(id);
        if (row == null || row.getDeletedAt() != null) {
            return Result.fail("记录不存在").toJson();
        }
        BindingRelations bind = resolveAcceptedBinding(user.getId());
        if (bind == null || !bind.getId().equals(row.getBindId())) {
            return Result.fail("无权操作此记录").toJson();
        }
        JSONArray comments = parseComments(row.getCommentsJson());
        boolean removed = false;
        for (int i = comments.size() - 1; i >= 0; i--) {
            Object obj = comments.get(i);
            if (!(obj instanceof JSONObject j)) {
                continue;
            }
            String cid = j.getString("id");
            if (!commentId.equals(cid)) {
                continue;
            }
            String uid = j.getString("userId");
            if (!user.getId().equals(uid)) {
                return Result.fail("只能删除自己的评论").toJson();
            }
            comments.remove(i);
            removed = true;
            break;
        }
        if (!removed) {
            return Result.fail("评论不存在").toJson();
        }
        row.setCommentsJson(comments.toJSONString());
        row.setUpdatedAt(new Date());
        diaryEntriesService.updateById(row);
        return Result.success("评论已删除", row).toJson();
    }

    private String normalizeMood(String mood) {
        if (StrUtil.isBlank(mood)) {
            return null;
        }
        String val = mood.trim();
        if (val.length() > MAX_MOOD_LENGTH) {
            return null;
        }
        return val;
    }

    private String normalizeContent(String content) {
        if (content == null) {
            return null;
        }
        String val = content.trim();
        if (val.length() > MAX_CONTENT_LENGTH) {
            return null;
        }
        return val;
    }

    private String normalizeImageUrl(String imageUrl) {
        if (imageUrl == null) {
            return "";
        }
        String val = imageUrl.trim();
        if (val.length() > MAX_IMAGE_URL_LENGTH) {
            return null;
        }
        return val;
    }

    private JSONObject buildUserJson(Users user) {
        JSONObject obj = new JSONObject();
        obj.put("userId", user.getId());
        obj.put("userName", user.getUsername());
        obj.put("nickname", StrUtil.isBlank(user.getNickname()) ? user.getUsername() : user.getNickname());
        obj.put("avatar", user.getAvatar());
        obj.put("gender", StrUtil.blankToDefault(user.getGender(), "other"));
        obj.put("time", formatDateTime(new Date()));
        return obj;
    }

    private String formatDateTime(Date date) {
        return new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(date);
    }

    private JSONArray parseComments(String commentsJson) {
        if (StrUtil.isBlank(commentsJson)) {
            return new JSONArray();
        }
        try {
            return JSON.parseArray(commentsJson);
        } catch (Exception ignore) {
            return new JSONArray();
        }
    }

    /**
     * 解析 yyyy-MM-dd
     */
    private Date parseDateOnly(String dateStr) {
        try {
            java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("yyyy-MM-dd");
            sdf.setLenient(false);
            return sdf.parse(dateStr);
        } catch (java.text.ParseException e) {
            throw new BusinessException("日期格式错误，请使用 yyyy-MM-dd");
        }
    }
}
