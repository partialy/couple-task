package cn.example.dataserver.interceptor;

import cn.example.dataserver.common.BusinessException;
import cn.example.dataserver.utils.AesEncryptUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Objects;

@Slf4j
@Component
public class DecryptQueryInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(@NonNull HttpServletRequest request,
                             @NonNull HttpServletResponse response,
                             @NonNull Object handler) {
        try {
            if (!(handler instanceof HandlerMethod)) {
                return true; // 非控制器方法，直接放行
            }
            String encrypt = request.getHeader("encrypt");
            if (Objects.equals(encrypt, "partialy")) {
                HttpServletRequest wrappedRequest = new HttpServletRequestWrapper(request) {
                    @Override
                    public String getParameter(String name) {
                        // 获取原始加密参数值
                        String encryptedValue = super.getParameter(name);
                        if (encryptedValue == null || encryptedValue.isEmpty()) {
                            return encryptedValue;
                        }
                        try {
                            String aesKey = super.getHeader("x-random-key");
                            if (aesKey == null || aesKey.length() != 32) {
                                throw new BusinessException("请求头 aes-key 必须是 32 位十六进制字符串");
                            }
                            // 解密参数值
                            return AesEncryptUtils.decryptWithRandomKey(aesKey, encryptedValue);
                        } catch (Exception e) {
                            throw new RuntimeException("查询参数 [" + name + "] 解密失败：" + e.getMessage(), e);
                        }
                    }
                };
                request.setAttribute("decryptedRequest", wrappedRequest);
                request = wrappedRequest;
                return true;
            }
            return true;
        } catch (Exception e) {
            throw new BusinessException("解密出错：" + e.getMessage());
        }
    }
}
