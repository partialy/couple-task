package cn.example.dataserver.services;

import cn.example.dataserver.common.BusinessException;
import cn.example.dataserver.common.Result;
import cn.example.dataserver.dto.UserLoginDTO;
import cn.example.dataserver.entity.BindingRelations;
import cn.example.dataserver.entity.Users;
import cn.example.dataserver.enums.BindingRelation;
import cn.example.dataserver.enums.UserGender;
import cn.example.dataserver.service.BindingRelationsService;
import cn.example.dataserver.service.UsersService;
import cn.example.dataserver.utils.JwtUtil;
import cn.example.dataserver.utils.PasswordEncoder;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.Map;
import java.util.Random;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final BindingRelationsService bindingRelationsService;
    @Value("${jwt.expiration:604800}")
    private long JWT_EXPIRATION;

    private final UsersService usersService;

    // 存储验证码及其过期时间 (简单内存实现)
    private final Map<String, String> codeMap = new ConcurrentHashMap<>();
    private final Map<String, Long> cooldownMap = new ConcurrentHashMap<>();

    public String sendCode(String target) {
        if (target == null || target.isEmpty()) {
            throw new BusinessException("请输入手机号或邮箱");
        }

        // 检查 60s 冷却
        long now = System.currentTimeMillis();
        if (cooldownMap.containsKey(target)) {
            long lastSend = cooldownMap.get(target);
            if (now - lastSend < 60000) {
                long remaining = 60 - (now - lastSend) / 1000;
                throw new BusinessException("请在 " + remaining + " 秒后再试");
            }
        }

        // 生成 6 位验证码
        String code = String.format("%06d", new Random().nextInt(1000000));
        codeMap.put(target, code);
        cooldownMap.put(target, now);

        // 模拟发送 (实际应调用短信/邮件服务)
        System.out.println("========================================");
        System.out.println("发送验证码到 [" + target + "]: " + code);
        System.out.println("========================================");

        return Result.success("验证码已发送").toJson();
    }

    public String login(Users userInput, String code) {
        String userInputName = getUserInput(userInput);
        LambdaQueryWrapper<Users> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Users::getUsername, userInputName)
                .or().eq(Users::getPhone, userInputName)
                .or().eq(Users::getEmail, userInputName);
        Users user = usersService.getOne(queryWrapper);
        if(user == null) {
            throw new BusinessException("用户不存在");
        }
        if(!PasswordEncoder.matches(userInput.getPassword(), user.getPassword())) {
            throw new BusinessException("密码错误");
        }
        String token = JwtUtil.createToken(user.getId(), JWT_EXPIRATION);
        user.setLastLoginAt(new Date());
        usersService.updateById(user);
        user.setPassword(null);
        BindingRelations bindRelation = bindingRelationsService.lambdaQuery()
                .and(wrapper -> wrapper.eq(BindingRelations::getUserId, user.getId())
                        .or().eq(BindingRelations::getTargetId, user.getId()))
                .eq(BindingRelations::getStatus, BindingRelation.ACCEPTED.getValue())
                .one();
        UserLoginDTO userLoginDTO = UserLoginDTO.builder()
                .token(token)
                .user(user)
                .bindingRelations(bindRelation)
                .build();
        return Result.success(userLoginDTO).toJson();
    }

    private String getUserInput(Users user) {
        String username = user.getUsername();
        String phone = user.getPhone();
        String email = user.getEmail();
        if(user.getPassword() == null || user.getPassword().isEmpty()) {
            throw new BusinessException("请输入密码");
        }
        if(username != null) {
            return username;
        } else if(phone != null) {
            return phone;
        } else if(email != null) {
            return email;
        } else {
            throw new BusinessException("请输入用户名、手机号或邮箱");
        }
    }

    public String logout(String token) {
        checkToken(token);
        return Result.success().toJson();
    }

    public String register(Users users, String code) {
        // 验证验证码
        String target = users.getPhone() != null ? users.getPhone() : users.getEmail();
        String inputCode = code;
        if (inputCode == null || inputCode.isEmpty()) {
            throw new BusinessException("请输入验证码");
        }
        String actualCode = codeMap.get(target);
        if (actualCode == null || !actualCode.equals(inputCode)) {
            throw new BusinessException("验证码错误或已过期");
        }


        String username = users.getUsername() == null ? UUID.randomUUID().toString().replaceAll("-", "").substring(1, 10) : users.getUsername();
        String plainPass = users.getPassword();
        String inviteCode = generateInviteCode();
        Users user = Users.builder()
                .id(UUID.randomUUID().toString())
                .username(username)
                .level(1)
                // 赠送 100 积分
                .points(100)
                .title("初出茅庐")
                .avatar(users.getAvatar())
                .phone(users.getPhone())
                .email(users.getEmail())
                .password(PasswordEncoder.encode(users.getPassword()))
                .gender(UserGender.OTHER.getValue())
                .inviteCode(inviteCode)
                .createdAt(new Date())
                .updatedAt(new Date())
                .build();
        LambdaQueryWrapper<Users> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Users::getUsername, user.getUsername())
                        .or().eq(Users::getPhone, user.getPhone())
                .or().eq(Users::getEmail, user.getEmail());
        boolean exists = usersService.exists(queryWrapper);
        if(exists) {
            throw new BusinessException("该手机号/邮箱已注册");
        }
        usersService.save(user);
        user.setPassword(plainPass);
        // 验证通过，清除验证码
        codeMap.remove(target);
        return login(user, code);
    }

    private String generateInviteCode() {
        String uuid = UUID.randomUUID().toString().replaceAll("-", "").toUpperCase();
        return String.format("%s-%s-%s",
                uuid.substring(0, 4),
                uuid.substring(4, 8),
                uuid.substring(8, 12));
    }

    public Users checkToken(String token) {
        // 验证令牌 (Token)
        String userid = JwtUtil.getSubjectFromToken(token);
        if (userid == null || !JwtUtil.validateToken(token)) {
            throw new BusinessException("无效的token");
        }

        // 获取当前用户
        Users currentUser = usersService.getById(userid);
        if (currentUser == null) {
            throw new BusinessException("用户不存在");
        }

        // 检查用户
        return switch (currentUser.getStatus()) {
            case "blocked" -> throw new BusinessException("用户被封禁：" + currentUser.getBlockEndAt());
            case "deleted" -> throw new BusinessException("用户被删除");
            case "disabled" -> throw new BusinessException("用户被禁用");
            default -> currentUser;
        };
    }
}
