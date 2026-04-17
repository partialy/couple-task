package cn.example.dataserver.admin.interceptor;

import cn.example.dataserver.admin.common.AdminAuthContext;
import cn.example.dataserver.admin.common.AdminBusinessException;
import cn.example.dataserver.utils.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Slf4j
@Component
public class AdminJwtInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull Object handler) {
        String token = request.getHeader("Authorization");
        if (token == null || token.isBlank()) {
            throw new AdminBusinessException("未登录或token缺失");
        }
        if (!JwtUtil.validateToken(token)) {
            throw new AdminBusinessException("token已失效");
        }
        String subject = JwtUtil.getSubjectFromToken(token);
        if (subject == null || !subject.startsWith("admin:")) {
            throw new AdminBusinessException("admin token无效");
        }
        AdminAuthContext.setAdminId(subject.substring("admin:".length()));
        return true;
    }

    @Override
    public void afterCompletion(
            HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull Object handler, Exception ex) {
        AdminAuthContext.clear();
    }
}
