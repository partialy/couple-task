package cn.example.dataserver.services;

import cn.example.dataserver.common.BusinessException;
import cn.example.dataserver.common.Result;
import cn.example.dataserver.dto.InviteDTO;
import cn.example.dataserver.entity.BindingRelations;
import cn.example.dataserver.entity.Users;
import cn.example.dataserver.enums.BindingRelation;
import cn.example.dataserver.service.BindingRelationsService;
import cn.example.dataserver.service.UsersService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BindingService {

    private final BindingRelationsService bindingRelationsService;
    private final UsersService usersService;
    private final ChatService chatService;

    @Transactional
    public String invite(Users user, String inviteCode) {
        if (user.getInviteCode().equals(inviteCode)) {
            throw new BusinessException("不能邀请自己");
        }

        Users targetUser = usersService.lambdaQuery()
                .eq(Users::getInviteCode, inviteCode)
                .one();
        if (targetUser == null) {
            throw new BusinessException("邀请码无效");
        }

        // 检查是否已经绑定
        boolean alreadyBound = bindingRelationsService.lambdaQuery()
                .and(wrapper -> wrapper.eq(BindingRelations::getUserId, user.getId())
                        .or().eq(BindingRelations::getTargetId, user.getId()))
                .eq(BindingRelations::getStatus, BindingRelation.ACCEPTED.getValue())
                .exists();
        if (alreadyBound) {
            throw new BusinessException("您已经有绑定关系了");
        }

        boolean targetBound = bindingRelationsService.lambdaQuery()
                .and(wrapper -> wrapper.eq(BindingRelations::getUserId, targetUser.getId())
                        .or().eq(BindingRelations::getTargetId, targetUser.getId()))
                .eq(BindingRelations::getStatus, BindingRelation.ACCEPTED.getValue())
                .exists();
        if (targetBound) {
            throw new BusinessException("对方已经有绑定关系了");
        }

        // 检查是否已经有待处理的邀请
        boolean pendingInvite = bindingRelationsService.lambdaQuery()
                .eq(BindingRelations::getUserId, user.getId())
                .eq(BindingRelations::getTargetId, targetUser.getId())
                .eq(BindingRelations::getStatus, BindingRelation.PENDING.getValue())
                .exists();
        if (pendingInvite) {
            throw new BusinessException("已经发送过邀请了，请耐心等待");
        }

        BindingRelations bindingRelation = new BindingRelations();
        bindingRelation.setId(UUID.randomUUID().toString());
        bindingRelation.setUserId(user.getId());
        bindingRelation.setTargetId(targetUser.getId());
        bindingRelation.setStatus(BindingRelation.PENDING.getValue());
        bindingRelation.setCreatedAt(new Date());
        bindingRelation.setUpdatedAt(new Date());

        bindingRelationsService.save(bindingRelation);
        return Result.success().toJson();
    }

    public String getReceivedInvites(Users user) {
        List<BindingRelations> invites = bindingRelationsService.lambdaQuery()
                .eq(BindingRelations::getTargetId, user.getId())
                .eq(BindingRelations::getStatus, BindingRelation.PENDING.getValue())
                .orderByDesc(BindingRelations::getCreatedAt)
                .list();

        List<InviteDTO> dtos = invites.stream().map(invite -> {
            Users sender = usersService.getById(invite.getUserId());
            if (sender != null) {
                sender.setPassword(null);
            }
            return InviteDTO.builder()
                    .invite(invite)
                    .otherUser(sender)
                    .build();
        }).collect(Collectors.toList());

        return Result.success(dtos).toJson();
    }

    public String getSentInvites(Users user) {
        List<BindingRelations> invites = bindingRelationsService.lambdaQuery()
                .eq(BindingRelations::getUserId, user.getId())
                .orderByDesc(BindingRelations::getCreatedAt)
                .list();

        List<InviteDTO> dtos = invites.stream().map(invite -> {
            Users receiver = usersService.getById(invite.getTargetId());
            if (receiver != null) {
                receiver.setPassword(null);
            }
            return InviteDTO.builder()
                    .invite(invite)
                    .otherUser(receiver)
                    .build();
        }).collect(Collectors.toList());

        return Result.success(dtos).toJson();
    }

    @Transactional
    public String accept(Users user, String inviteId) {
        BindingRelations invite = bindingRelationsService.getById(inviteId);
        if (invite == null || !invite.getTargetId().equals(user.getId())) {
            throw new BusinessException("邀请不存在");
        }
        if (!invite.getStatus().equals(BindingRelation.PENDING.getValue())) {
            throw new BusinessException("该邀请已处理");
        }

        // 检查任一用户是否已经绑定
        boolean userBound = bindingRelationsService.lambdaQuery()
                .and(wrapper -> wrapper.eq(BindingRelations::getUserId, user.getId())
                        .or().eq(BindingRelations::getTargetId, user.getId()))
                .eq(BindingRelations::getStatus, BindingRelation.ACCEPTED.getValue())
                .exists();
        if (userBound) {
            throw new BusinessException("您已经有绑定关系了");
        }

        boolean senderBound = bindingRelationsService.lambdaQuery()
                .and(wrapper -> wrapper.eq(BindingRelations::getUserId, invite.getUserId())
                        .or().eq(BindingRelations::getTargetId, invite.getUserId()))
                .eq(BindingRelations::getStatus, BindingRelation.ACCEPTED.getValue())
                .exists();
        if (senderBound) {
            throw new BusinessException("对方已经有绑定关系了");
        }

        invite.setStatus(BindingRelation.ACCEPTED.getValue());
        invite.setUpdatedAt(new Date());
        bindingRelationsService.updateById(invite);

        // 绑定成功后创建双人聊天会话
        chatService.ensureConversationBetweenUsers(invite.getUserId(), user.getId());

        // 拒绝两个用户的所有其他待处理邀请
        bindingRelationsService.lambdaUpdate()
                .set(BindingRelations::getStatus, BindingRelation.REJECTED.getValue())
                .set(BindingRelations::getUpdatedAt, new Date())
                .eq(BindingRelations::getStatus, BindingRelation.PENDING.getValue())
                .and(wrapper -> wrapper.eq(BindingRelations::getUserId, user.getId())
                        .or().eq(BindingRelations::getTargetId, user.getId())
                        .or().eq(BindingRelations::getUserId, invite.getUserId())
                        .or().eq(BindingRelations::getTargetId, invite.getUserId()))
                .update();

        return Result.success().toJson();
    }

    @Transactional
    public String reject(Users user, String inviteId) {
        BindingRelations invite = bindingRelationsService.getById(inviteId);
        if (invite == null || !invite.getTargetId().equals(user.getId())) {
            throw new BusinessException("邀请不存在");
        }
        if (!invite.getStatus().equals(BindingRelation.PENDING.getValue())) {
            throw new BusinessException("该邀请已处理");
        }

        invite.setStatus(BindingRelation.REJECTED.getValue());
        invite.setUpdatedAt(new Date());
        bindingRelationsService.updateById(invite);

        return Result.success().toJson();
    }
}
