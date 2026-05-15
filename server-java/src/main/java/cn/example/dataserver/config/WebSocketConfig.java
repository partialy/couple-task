package cn.example.dataserver.config;

import cn.example.dataserver.websocket.ChatHandshakeInterceptor;
import cn.example.dataserver.websocket.ChatWebSocketHandler;
import cn.example.dataserver.websocket.SystemNoticeHandshakeInterceptor;
import cn.example.dataserver.websocket.SystemNoticeWebSocketHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

/**
 * 注册聊天 WebSocket 端点
 */
@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer {

    private final ChatWebSocketHandler chatWebSocketHandler;
    private final ChatHandshakeInterceptor chatHandshakeInterceptor;
    private final SystemNoticeWebSocketHandler systemNoticeWebSocketHandler;
    private final SystemNoticeHandshakeInterceptor systemNoticeHandshakeInterceptor;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(chatWebSocketHandler, "/ws/chat")
                .addInterceptors(chatHandshakeInterceptor)
                .setAllowedOrigins("*");
        registry.addHandler(systemNoticeWebSocketHandler, "/ws/system-notice")
                .addInterceptors(systemNoticeHandshakeInterceptor)
                .setAllowedOrigins("*");
    }
}
