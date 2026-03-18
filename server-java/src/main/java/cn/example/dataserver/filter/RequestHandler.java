package cn.example.dataserver.filter;

import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpInputMessage;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.json.MappingJacksonInputMessage;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.RequestBodyAdviceAdapter;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.Type;
import java.nio.charset.StandardCharsets;

@Slf4j
@RestControllerAdvice
public class RequestHandler extends RequestBodyAdviceAdapter {

    @Override
    public boolean supports(@NonNull MethodParameter methodParameter,
                            @NonNull Type targetType,
                            @NonNull Class<? extends HttpMessageConverter<?>> converterType) {
        return true;
    }

    @Override
    @NonNull
    public HttpInputMessage beforeBodyRead(@NonNull HttpInputMessage inputMessage,
                                           @NonNull MethodParameter parameter,
                                           @NonNull Type targetType,
                                           @NonNull Class<? extends HttpMessageConverter<?>> converterType
    ) throws IOException {
        HttpHeaders headers = inputMessage.getHeaders();
        InputStream inputStream = inputMessage.getBody();
        ByteArrayOutputStream body = new ByteArrayOutputStream();
        int i;
        while ((i = inputStream.read()) != -1) {
            // 拿到原始请求体
            body.write(i);
        }

        try {
            // 在此处进行请求体处理（如解密）
            String bodyStr = body.toString(StandardCharsets.UTF_8);
            log.info("请求体：{}", body.toString(StandardCharsets.UTF_8));
            InputStream newInputStream = new ByteArrayInputStream(bodyStr.getBytes(StandardCharsets.UTF_8));
            return new MappingJacksonInputMessage(newInputStream, headers);
        } catch (Exception e) {
            log.error("参数解析出错：{}", e.getMessage());
            return new MappingJacksonInputMessage(inputStream, headers);
        }

    }
}
