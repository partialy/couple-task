package cn.example.dataserver.interceptor;

import com.alibaba.fastjson2.JSONObject;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Slf4j
@Component
public class LogInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull Object handler) {
        JSONObject params = new JSONObject();
        request.getParameterMap().forEach((k, v) -> params.put(k, v[0]));
        log.info("收到请求：{} {}，参数：{}", request.getMethod(), request.getRequestURI(), params.toJSONString());
        return true;
    }

    @Override
    public void afterCompletion(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull Object handler, Exception ex) {
        log.info("请求结束，{} {} -> {}", request.getMethod(), request.getRequestURI(), response.getStatus());
    }
}
