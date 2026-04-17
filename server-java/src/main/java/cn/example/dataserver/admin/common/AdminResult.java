package cn.example.dataserver.admin.common;

import com.alibaba.fastjson2.JSON;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AdminResult<T> {
    private Integer code;
    private String message;
    private T data;
    private String traceId;

    public static <T> AdminResult<T> success(T data, String traceId) {
        return new AdminResult<>(0, "ok", data, traceId);
    }

    public static <T> AdminResult<T> success(String traceId) {
        return new AdminResult<>(0, "ok", null, traceId);
    }

    public static <T> AdminResult<T> fail(Integer code, String message, String traceId) {
        return new AdminResult<>(code, message, null, traceId);
    }

    public String toJson() {
        return JSON.toJSONString(this);
    }
}
