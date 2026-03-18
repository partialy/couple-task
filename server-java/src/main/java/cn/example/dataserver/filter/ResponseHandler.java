package cn.example.dataserver.filter;

import cn.example.dataserver.utils.AesEncryptUtils;
import com.alibaba.fastjson2.JSON;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NonNull;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

import java.util.Objects;

@ControllerAdvice
public class ResponseHandler implements ResponseBodyAdvice<Object> {

    @Override
    public boolean supports(@NonNull MethodParameter returnType,
                            @NonNull Class<? extends HttpMessageConverter<?>> converterType) {
        return true;
    }

    @Override
    public Object beforeBodyWrite(Object body,
                                  @NonNull MethodParameter returnType,
                                  @NonNull MediaType selectedContentType,
                                  @NonNull Class<? extends HttpMessageConverter<?>> selectedConverterType,
                                  @NonNull ServerHttpRequest request,
                                  @NonNull ServerHttpResponse response) {
        String enc = request.getHeaders().getFirst("encrypt");
        if(Objects.equals(enc, "partialy")) {
            String bodyJson;
            if(body instanceof String) {
                bodyJson = (String) body;
            } else {
                bodyJson = JSON.toJSONString(body);
            }
            AesEncryptUtils.EncResult encResult = AesEncryptUtils.encryptRandom(bodyJson);
            response.getHeaders().add("x-random-key", encResult.getRandomKey());
            response.getHeaders().add("encrypt", "partialy");
            return JSON.toJSONString(new EncResponseBody(encResult.getSecretText(), true));
        } else {
            return body;
        }
    }

    @Data
    @AllArgsConstructor
    public static class EncResponseBody {
        private String EncData;
        private Boolean Enc;
    }
}
