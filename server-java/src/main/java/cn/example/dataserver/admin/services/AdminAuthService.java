package cn.example.dataserver.admin.services;

import cn.example.dataserver.admin.common.AdminBusinessException;
import cn.example.dataserver.admin.dto.AdminLoginDTO;
import cn.example.dataserver.admin.entity.AdminUsers;
import cn.example.dataserver.utils.JwtUtil;
import cn.example.dataserver.utils.PasswordEncoder;
import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminAuthService {

    private final AdminUsersService adminUsersService;

    public Map<String, Object> login(AdminLoginDTO loginDTO) {
        validateLoginDTO(loginDTO);
        AdminUsers admin = findByUsername(loginDTO.getUsername());
        ensureAccountUsable(admin);
        checkPassword(admin, loginDTO.getPassword());
        String token = JwtUtil.createToken("admin:" + admin.getId(), 1000L * 60 * 60 * 24);
        Map<String, Object> data = new HashMap<>();
        data.put("token", token);
        data.put("expireAt", new Date(System.currentTimeMillis() + 1000L * 60 * 60 * 24));
        Map<String, Object> adminInfo = new HashMap<>();
        adminInfo.put("id", String.valueOf(admin.getId()));
        adminInfo.put("name", StrUtil.blankToDefault(admin.getName(), admin.getUsername()));
        adminInfo.put("role", Integer.valueOf(1).equals(admin.getIsSuper()) ? "SUPER_ADMIN" : "ADMIN");
        data.put("adminInfo", adminInfo);
        return data;
    }

    public Map<String, Object> me(String adminId) {
        AdminUsers admin = loadAdminById(adminId);
        Map<String, Object> data = new HashMap<>();
        data.put("id", String.valueOf(admin.getId()));
        data.put("name", StrUtil.blankToDefault(admin.getName(), admin.getUsername()));
        data.put("role", Integer.valueOf(1).equals(admin.getIsSuper()) ? "SUPER_ADMIN" : "ADMIN");
        return data;
    }

    private void validateLoginDTO(AdminLoginDTO loginDTO) {
        if (loginDTO == null || StrUtil.isBlank(loginDTO.getUsername()) || StrUtil.isBlank(loginDTO.getPassword())) {
            throw new AdminBusinessException("用户名或密码不能为空");
        }
    }

    private AdminUsers findByUsername(String username) {
        LambdaQueryWrapper<AdminUsers> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(AdminUsers::getUsername, username).isNull(AdminUsers::getDeletedAt).last("limit 1");
        AdminUsers admin = adminUsersService.getOne(wrapper);
        if (admin == null) {
            throw new AdminBusinessException("管理员不存在");
        }
        return admin;
    }

    private void ensureAccountUsable(AdminUsers admin) {
        if (!"active".equalsIgnoreCase(StrUtil.blankToDefault(admin.getStatus(), ""))) {
            throw new AdminBusinessException("账号已停用");
        }
    }

    /**
     * 密码校验：库中明文与输入一致，或 {@link PasswordEncoder}（MD5）与库中一致，任一成功即可。
     */
    private void checkPassword(AdminUsers admin, String rawPassword) {
        String stored = admin.getPassword();
        if (StrUtil.isBlank(stored)) {
            throw new AdminBusinessException("密码错误");
        }
        boolean plainOk = StrUtil.equals(stored, rawPassword);
        boolean encodedOk = PasswordEncoder.matches(rawPassword, stored);
        if (!plainOk && !encodedOk) {
            throw new AdminBusinessException("密码错误");
        }
    }

    private AdminUsers loadAdminById(String adminId) {
        if (StrUtil.isBlank(adminId)) {
            throw new AdminBusinessException("管理员不存在");
        }
        Long id;
        try {
            id = Long.parseLong(adminId);
        } catch (NumberFormatException e) {
            throw new AdminBusinessException("管理员不存在");
        }
        AdminUsers admin = adminUsersService.getById(id);
        if (admin == null || admin.getDeletedAt() != null) {
            throw new AdminBusinessException("管理员不存在");
        }
        return admin;
    }
}
