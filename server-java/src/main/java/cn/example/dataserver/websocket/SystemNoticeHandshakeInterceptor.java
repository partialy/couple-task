package cn.example.dataserver.websocket;

import cn.example.dataserver.utils.JwtUtil;
import cn.hutool.core.util.StrUtil;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

@Slf4j
@Component
public class SystemNoticeHandshakeInterceptor implements HandshakeInterceptor {

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler,
                                   Map<String, Object> attributes) {
        if (!(request instanceof ServletServerHttpRequest servletRequest)) {
            return false;
        }
        String token = servletRequest.getServletRequest().getParameter("token");
        if (StrUtil.isBlank(token)) {
            token = servletRequest.getServletRequest().getHeader("Authorization");
        }
        if (StrUtil.isBlank(token) || !JwtUtil.validateToken(token)) {
            return false;
        }
        String userId = JwtUtil.getSubjectFromToken(token);
        if (StrUtil.isBlank(userId)) {
            return false;
        }
        attributes.put("userId", userId);
        return true;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler,
                               Exception exception) {
    }
}
