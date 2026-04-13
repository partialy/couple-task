package cn.example.dataserver.services;

import cn.example.dataserver.common.Result;
import cn.example.dataserver.dto.MomentAddDTO;
import cn.example.dataserver.dto.MomentCommentAddDTO;
import cn.example.dataserver.dto.MomentCommentVO;
import cn.example.dataserver.dto.MomentListItemVO;
import cn.example.dataserver.entity.BindMomentComment;
import cn.example.dataserver.entity.BindMomentImage;
import cn.example.dataserver.entity.BindMomentLike;
import cn.example.dataserver.entity.BindMoments;
import cn.example.dataserver.entity.BindingRelations;
import cn.example.dataserver.entity.Users;
import cn.example.dataserver.enums.BindingRelation;
import cn.example.dataserver.service.BindMomentCommentService;
import cn.example.dataserver.service.BindMomentImageService;
import cn.example.dataserver.service.BindMomentLikeService;
import cn.example.dataserver.service.BindMomentsService;
import cn.example.dataserver.service.BindingRelationsService;
import cn.example.dataserver.service.UsersService;
import cn.hutool.core.util.StrUtil;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class MomentsServiceImplements {

    public static final String BIZ_SCENE_TASK_PUBLISH = "task_publish";
    public static final String BIZ_SCENE_TASK_ACCEPT = "task_accept";
    public static final String BIZ_SCENE_TASK_COMPLETE = "task_complete";
    public static final String REMARK_SYSTEM = "【系统自动发出】";

    private static final int MAX_CONTENT_LEN = 2000;
    private static final int MAX_COMMENT_LEN = 1000;
    private static final int MAX_IMAGES = 9;
    private static final int MAX_URL_LEN = 512;
    private static final int LIST_LIMIT = 200;

    private final AuthService authService;
    private final BindingRelationsService bindingRelationsService;
    private final BindMomentsService bindMomentsService;
    private final BindMomentImageService bindMomentImageService;
    private final BindMomentLikeService bindMomentLikeService;
    private final BindMomentCommentService bindMomentCommentService;
    private final UsersService usersService;

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

    private String displayName(Users u) {
        if (u == null) {
            return "用户";
        }
        if (StrUtil.isNotBlank(u.getNickname())) {
            return u.getNickname().trim();
        }
        return StrUtil.blankToDefault(u.getUsername(), "用户");
    }

    private BindMoments requireMomentInBind(String momentId, String bindId) {
        if (StrUtil.isBlank(momentId)) {
            return null;
        }
        BindMoments m = bindMomentsService.getById(momentId);
        if (m == null || m.getDeletedAt() != null) {
            return null;
        }
        if (!bindId.equals(m.getBindId())) {
            return null;
        }
        return m;
    }

    private Map<String, Users> loadUsers(Set<String> userIds) {
        if (userIds.isEmpty()) {
            return Collections.emptyMap();
        }
        List<Users> list = usersService.listByIds(userIds);
        Map<String, Users> map = new HashMap<>(list.size());
        for (Users u : list) {
            map.put(u.getId(), u);
        }
        return map;
    }

    private Map<String, List<String>> loadImagesByMomentIds(Set<String> momentIds) {
        if (momentIds.isEmpty()) {
            return Collections.emptyMap();
        }
        List<BindMomentImage> rows = bindMomentImageService.lambdaQuery()
                .in(BindMomentImage::getMomentId, momentIds)
                .list();
        Map<String, List<BindMomentImage>> grouped = new HashMap<>();
        for (BindMomentImage row : rows) {
            grouped.computeIfAbsent(row.getMomentId(), k -> new ArrayList<>()).add(row);
        }
        Map<String, List<String>> out = new HashMap<>();
        for (Map.Entry<String, List<BindMomentImage>> e : grouped.entrySet()) {
            List<BindMomentImage> sorted = e.getValue().stream()
                    .sorted(Comparator.comparingInt(a -> a.getSortOrder() == null ? 0 : a.getSortOrder()))
                    .collect(Collectors.toList());
            out.put(e.getKey(), sorted.stream().map(BindMomentImage::getUrl).collect(Collectors.toList()));
        }
        return out;
    }

    private Map<String, Long> countLikes(Set<String> momentIds) {
        if (momentIds.isEmpty()) {
            return Collections.emptyMap();
        }
        List<BindMomentLike> likes = bindMomentLikeService.lambdaQuery()
                .in(BindMomentLike::getMomentId, momentIds)
                .list();
        Map<String, Long> counts = new HashMap<>();
        for (BindMomentLike l : likes) {
            counts.merge(l.getMomentId(), 1L, Long::sum);
        }
        return counts;
    }

    private Set<String> likedMomentIdsForUser(Set<String> momentIds, String userId) {
        if (momentIds.isEmpty()) {
            return Collections.emptySet();
        }
        List<BindMomentLike> mine = bindMomentLikeService.lambdaQuery()
                .in(BindMomentLike::getMomentId, momentIds)
                .eq(BindMomentLike::getUserId, userId)
                .list();
        return mine.stream().map(BindMomentLike::getMomentId).collect(Collectors.toSet());
    }

    private Map<String, Long> countComments(Set<String> momentIds) {
        if (momentIds.isEmpty()) {
            return Collections.emptyMap();
        }
        List<BindMomentComment> comments = bindMomentCommentService.lambdaQuery()
                .in(BindMomentComment::getMomentId, momentIds)
                .isNull(BindMomentComment::getDeletedAt)
                .list();
        Map<String, Long> counts = new HashMap<>();
        for (BindMomentComment c : comments) {
            counts.merge(c.getMomentId(), 1L, Long::sum);
        }
        return counts;
    }

    private MomentListItemVO toListItem(
            BindMoments m,
            Map<String, Users> usersMap,
            Map<String, List<String>> imagesMap,
            Map<String, Long> likeCounts,
            Map<String, Long> commentCounts,
            Set<String> likedIds) {
        MomentListItemVO vo = new MomentListItemVO();
        vo.setId(m.getId());
        vo.setAuthorUserId(m.getAuthorUserId());
        Users author = usersMap.get(m.getAuthorUserId());
        vo.setUserName(displayName(author));
        vo.setAvatar(author != null && StrUtil.isNotBlank(author.getAvatar()) ? author.getAvatar() : "");
        vo.setCreatedAt(m.getCreatedAt() != null ? m.getCreatedAt().getTime() : 0L);
        vo.setContent(m.getContent());
        vo.setImages(imagesMap.getOrDefault(m.getId(), Collections.emptyList()));
        vo.setLikes(likeCounts.getOrDefault(m.getId(), 0L).intValue());
        vo.setLikedByMe(likedIds.contains(m.getId()));
        vo.setCommentCount(commentCounts.getOrDefault(m.getId(), 0L).intValue());
        vo.setBizUuid(m.getBizUuid());
        vo.setBizScene(m.getBizScene());
        vo.setRemark(m.getRemark());
        return vo;
    }

    /**
     * 服务端自动写入动态（任务完成/发布等）。失败仅打日志，不向调用方抛错。
     */
    public void publishSystemMoment(
            String bindId,
            String authorUserId,
            String content,
            List<String> imageUrls,
            String bizUuid,
            String bizScene,
            String remark) {
        if (StrUtil.isBlank(bindId) || StrUtil.isBlank(authorUserId)) {
            log.warn("publishSystemMoment skip: blank bindId or author");
            return;
        }
        BindingRelations br = requireBind(authorUserId, bindId);
        if (br == null) {
            log.warn("publishSystemMoment skip: invalid bind bindId={} author={}", bindId, authorUserId);
            return;
        }
        String text = StrUtil.blankToDefault(content, "").trim();
        List<String> urls = imageUrls == null ? Collections.emptyList() : imageUrls;
        if (text.isEmpty() && urls.isEmpty()) {
            log.warn("publishSystemMoment skip: empty content and images");
            return;
        }
        if (text.length() > MAX_CONTENT_LEN) {
            text = text.substring(0, MAX_CONTENT_LEN);
        }
        try {
            Date now = new Date();
            String id = UUID.randomUUID().toString();
            BindMoments row = new BindMoments();
            row.setId(id);
            row.setBindId(bindId);
            row.setAuthorUserId(authorUserId);
            row.setContent(text.isEmpty() ? "" : text);
            row.setBizUuid(bizUuid);
            row.setBizScene(bizScene);
            row.setRemark(remark);
            row.setCreatedAt(now);
            row.setUpdatedAt(now);
            bindMomentsService.save(row);

            int order = 0;
            for (String url : urls) {
                if (StrUtil.isBlank(url) || url.length() > MAX_URL_LEN) {
                    continue;
                }
                if (order >= MAX_IMAGES) {
                    break;
                }
                BindMomentImage img = new BindMomentImage();
                img.setId(UUID.randomUUID().toString());
                img.setMomentId(id);
                img.setUrl(url.trim());
                img.setSortOrder(order++);
                bindMomentImageService.save(img);
            }
        } catch (DuplicateKeyException e) {
            log.warn("duplicate system moment bindId={} bizUuid={} scene={}", bindId, bizUuid, bizScene);
        } catch (DataIntegrityViolationException e) {
            Throwable cause = e.getMostSpecificCause();
            String msg = cause != null ? cause.getMessage() : "";
            if (msg != null && (msg.contains("Duplicate") || msg.contains("duplicate"))) {
                log.warn("duplicate system moment (integrity) bindId={} bizUuid={} scene={}", bindId, bizUuid, bizScene);
            } else {
                log.warn("publishSystemMoment data integrity failed", e);
            }
        } catch (Exception e) {
            log.warn("publishSystemMoment failed", e);
        }
    }

    public String list(String token, String bindId) {
        Users user = authService.checkToken(token);
        BindingRelations bind = requireBind(user.getId(), bindId);
        if (bind == null) {
            return Result.fail("绑定关系无效").toJson();
        }
        List<BindMoments> raw = bindMomentsService.lambdaQuery()
                .eq(BindMoments::getBindId, bindId)
                .isNull(BindMoments::getDeletedAt)
                .orderByDesc(BindMoments::getCreatedAt)
                .last("LIMIT " + LIST_LIMIT)
                .list();
        Collections.reverse(raw);

        Set<String> ids = raw.stream().map(BindMoments::getId).collect(Collectors.toSet());
        Set<String> authorIds = raw.stream().map(BindMoments::getAuthorUserId).collect(Collectors.toSet());
        Map<String, Users> usersMap = loadUsers(authorIds);
        Map<String, List<String>> imagesMap = loadImagesByMomentIds(ids);
        Map<String, Long> likeCounts = countLikes(ids);
        Map<String, Long> commentCounts = countComments(ids);
        Set<String> likedIds = likedMomentIdsForUser(ids, user.getId());

        List<MomentListItemVO> list = raw.stream()
                .map(m -> toListItem(m, usersMap, imagesMap, likeCounts, commentCounts, likedIds))
                .collect(Collectors.toList());
        return Result.success(list).toJson();
    }

    @Transactional(rollbackFor = Exception.class)
    public String add(String token, MomentAddDTO dto) {
        Users user = authService.checkToken(token);
        if (dto == null || StrUtil.isBlank(dto.getBindId())) {
            return Result.fail("bindId 不能为空").toJson();
        }
        BindingRelations bind = requireBind(user.getId(), dto.getBindId());
        if (bind == null) {
            return Result.fail("绑定关系无效").toJson();
        }
        String content = StrUtil.isBlank(dto.getContent()) ? "" : dto.getContent().trim();
        List<String> urls = dto.getImageUrls() == null ? Collections.emptyList() : dto.getImageUrls();
        if (content.isEmpty() && urls.isEmpty()) {
            return Result.fail("请填写文字或添加图片").toJson();
        }
        if (content.length() > MAX_CONTENT_LEN) {
            return Result.fail("内容不能超过 " + MAX_CONTENT_LEN + " 字").toJson();
        }
        if (urls.size() > MAX_IMAGES) {
            return Result.fail("图片不能超过 " + MAX_IMAGES + " 张").toJson();
        }
        for (String url : urls) {
            if (url == null || url.length() > MAX_URL_LEN) {
                return Result.fail("图片地址无效").toJson();
            }
        }

        Date now = new Date();
        String id = UUID.randomUUID().toString();
        BindMoments row = new BindMoments();
        row.setId(id);
        row.setBindId(bind.getId());
        row.setAuthorUserId(user.getId());
        row.setContent(content);
        row.setCreatedAt(now);
        row.setUpdatedAt(now);
        bindMomentsService.save(row);

        int order = 0;
        for (String url : urls) {
            if (StrUtil.isBlank(url)) {
                continue;
            }
            BindMomentImage img = new BindMomentImage();
            img.setId(UUID.randomUUID().toString());
            img.setMomentId(id);
            img.setUrl(url.trim());
            img.setSortOrder(order++);
            bindMomentImageService.save(img);
        }

        Set<String> ids = Collections.singleton(id);
        Map<String, Users> usersMap = loadUsers(Collections.singleton(user.getId()));
        Map<String, List<String>> imagesMap = loadImagesByMomentIds(ids);
        Map<String, Long> likeCounts = countLikes(ids);
        Map<String, Long> commentCounts = countComments(ids);
        Set<String> likedIds = likedMomentIdsForUser(ids, user.getId());
        MomentListItemVO vo = toListItem(row, usersMap, imagesMap, likeCounts, commentCounts, likedIds);
        return Result.success("已发布", vo).toJson();
    }

    @Transactional(rollbackFor = Exception.class)
    public String toggleLike(String token, String bindId, String momentId) {
        Users user = authService.checkToken(token);
        BindingRelations bind = requireBind(user.getId(), bindId);
        if (bind == null) {
            return Result.fail("绑定关系无效").toJson();
        }
        BindMoments m = requireMomentInBind(momentId, bind.getId());
        if (m == null) {
            return Result.fail("动态不存在").toJson();
        }
        BindMomentLike existing = bindMomentLikeService.lambdaQuery()
                .eq(BindMomentLike::getMomentId, momentId)
                .eq(BindMomentLike::getUserId, user.getId())
                .one();
        if (existing != null) {
            bindMomentLikeService.removeById(existing.getId());
        } else {
            BindMomentLike like = new BindMomentLike();
            like.setId(UUID.randomUUID().toString());
            like.setMomentId(momentId);
            like.setUserId(user.getId());
            like.setCreatedAt(new Date());
            bindMomentLikeService.save(like);
        }
        long cnt = bindMomentLikeService.lambdaQuery()
                .eq(BindMomentLike::getMomentId, momentId)
                .count();
        boolean liked = existing == null;
        Map<String, Object> data = new HashMap<>(4);
        data.put("likes", cnt);
        data.put("likedByMe", liked);
        return Result.success(data).toJson();
    }

    @Transactional(rollbackFor = Exception.class)
    public String addComment(String token, MomentCommentAddDTO dto) {
        Users user = authService.checkToken(token);
        if (dto == null || StrUtil.isBlank(dto.getBindId()) || StrUtil.isBlank(dto.getMomentId())) {
            return Result.fail("参数不完整").toJson();
        }
        BindingRelations bind = requireBind(user.getId(), dto.getBindId());
        if (bind == null) {
            return Result.fail("绑定关系无效").toJson();
        }
        BindMoments m = requireMomentInBind(dto.getMomentId(), bind.getId());
        if (m == null) {
            return Result.fail("动态不存在").toJson();
        }
        String text = StrUtil.isBlank(dto.getContent()) ? "" : dto.getContent().trim();
        if (text.isEmpty()) {
            return Result.fail("评论不能为空").toJson();
        }
        if (text.length() > MAX_COMMENT_LEN) {
            return Result.fail("评论不能超过 " + MAX_COMMENT_LEN + " 字").toJson();
        }
        Date now = new Date();
        BindMomentComment c = new BindMomentComment();
        c.setId(UUID.randomUUID().toString());
        c.setMomentId(dto.getMomentId());
        c.setAuthorUserId(user.getId());
        c.setContent(text);
        c.setCreatedAt(now);
        bindMomentCommentService.save(c);

        Map<String, Users> usersMap = loadUsers(Collections.singleton(user.getId()));
        MomentCommentVO vo = new MomentCommentVO();
        vo.setId(c.getId());
        vo.setAuthorUserId(user.getId());
        vo.setUserName(displayName(usersMap.get(user.getId())));
        Users self = usersMap.get(user.getId());
        vo.setAvatar(self != null && StrUtil.isNotBlank(self.getAvatar()) ? self.getAvatar() : "");
        vo.setCreatedAt(now.getTime());
        vo.setContent(text);
        return Result.success("已评论", vo).toJson();
    }

    public String listComments(String token, String bindId, String momentId) {
        Users user = authService.checkToken(token);
        BindingRelations bind = requireBind(user.getId(), bindId);
        if (bind == null) {
            return Result.fail("绑定关系无效").toJson();
        }
        BindMoments m = requireMomentInBind(momentId, bind.getId());
        if (m == null) {
            return Result.fail("动态不存在").toJson();
        }
        List<BindMomentComment> rows = bindMomentCommentService.lambdaQuery()
                .eq(BindMomentComment::getMomentId, momentId)
                .isNull(BindMomentComment::getDeletedAt)
                .orderByAsc(BindMomentComment::getCreatedAt)
                .list();
        Set<String> authorIds = rows.stream()
                .map(BindMomentComment::getAuthorUserId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Map<String, Users> usersMap = loadUsers(authorIds);
        List<MomentCommentVO> out = new ArrayList<>(rows.size());
        for (BindMomentComment c : rows) {
            MomentCommentVO vo = new MomentCommentVO();
            vo.setId(c.getId());
            vo.setAuthorUserId(c.getAuthorUserId());
            Users au = usersMap.get(c.getAuthorUserId());
            vo.setUserName(displayName(au));
            vo.setAvatar(au != null && StrUtil.isNotBlank(au.getAvatar()) ? au.getAvatar() : "");
            vo.setCreatedAt(c.getCreatedAt() != null ? c.getCreatedAt().getTime() : 0L);
            vo.setContent(c.getContent());
            out.add(vo);
        }
        return Result.success(out).toJson();
    }
}
