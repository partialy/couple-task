package cn.example.dataserver.interceptor;

import cn.example.dataserver.common.TokenErrorException;
import cn.example.dataserver.utils.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpMethod;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Objects;

@Slf4j
@Component
public class JwtInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull Object handler) throws Exception {

        log.info("经过JwtInterceptor");
        if (Objects.equals(request.getMethod(), HttpMethod.OPTIONS.name())) {
            log.info("OPTIONS请求，放行");
            return true;
        }
        // 获取请求头中的令牌 (Token)
        String token = request.getHeader("Authorization");
        log.info("收到令牌: {}", token);
        // 如果没有令牌，则尝试从参数中获取
        if (token == null || token.isEmpty()) {
            token = request.getParameter("token");
        }

        // 如果有令牌，验证其有效性
        if (token != null && !token.isEmpty()) {
            if (!JwtUtil.validateToken(token)) {
                throw new TokenErrorException("令牌失效或者过期");
            }
        } else {
            throw new TokenErrorException("令牌失效或者过期");
        }
        return true;
    }
}