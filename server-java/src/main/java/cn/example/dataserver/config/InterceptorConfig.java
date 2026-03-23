package cn.example.dataserver.config;

import cn.example.dataserver.interceptor.DecryptQueryInterceptor;
import cn.example.dataserver.interceptor.JwtInterceptor;
import cn.example.dataserver.interceptor.LogInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class InterceptorConfig implements WebMvcConfigurer {

    private final JwtInterceptor jwtInterceptor;
    private final LogInterceptor logInterceptor;
    private final DecryptQueryInterceptor decryptQueryInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(decryptQueryInterceptor);
        registry.addInterceptor(logInterceptor);
        registry.addInterceptor(jwtInterceptor)
                .addPathPatterns("/**") // 拦截所有请求
                .excludePathPatterns(
                        "/auth/logout",
                        "/auth/login",
                        "/auth/register",
                        "/auth/sendCode",
                        "/ws/**",
                        "/error"
                ); // 排除接口
    }
}