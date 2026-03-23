package cn.example.dataserver.websocket;

import cn.example.dataserver.utils.JwtUtil;
import cn.hutool.core.util.StrUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

/**
 * WebSocket 握手时校验 JWT，将 userId 放入会话属性
 */
@Slf4j
@Component
public class ChatHandshakeInterceptor implements HandshakeInterceptor {

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler,
                                     Map<String, Object> attributes) {
        if (!(request instanceof ServletServerHttpRequest servletRequest)) {
            log.warn("聊天 WebSocket 握手失败：非 Servlet 请求");
            return false;
        }
        String token = servletRequest.getServletRequest().getParameter("token");
        if (StrUtil.isBlank(token)) {
            token = servletRequest.getServletRequest().getHeader("Authorization");
        }
        if (StrUtil.isBlank(token)) {
            log.warn("聊天 WebSocket 握手失败：未提供 token");
            return false;
        }
        if (!JwtUtil.validateToken(token)) {
            log.warn("聊天 WebSocket 握手失败：token 无效或已过期");
            return false;
        }
        String userId = JwtUtil.getSubjectFromToken(token);
        if (StrUtil.isBlank(userId)) {
            log.warn("聊天 WebSocket 握手失败：无法解析用户 ID");
            return false;
        }
        attributes.put("userId", userId);
        return true;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler,
                                Exception exception) {
        // 无需后处理
    }
}
