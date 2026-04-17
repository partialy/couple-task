package cn.example.dataserver.admin.config;

import cn.example.dataserver.admin.interceptor.AdminJwtInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class AdminInterceptorConfig implements WebMvcConfigurer {

    private final AdminJwtInterceptor adminJwtInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(adminJwtInterceptor)
                .addPathPatterns("/admin/v1/**")
                .excludePathPatterns("/admin/v1/auth/login");
    }
}
