package cn.example.dataserver.common;

import com.alibaba.fastjson2.JSON;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class Result<T> {
    private int code;
    private String msg;
    private T data;
    private String errorMsg;
    private boolean success;

    public static <T> Result<T> success(T data) {
        return new Result<>(0, "成功", data, null, true);
    }

    public static <T> Result<T> success(String msg, T data) {
        return new Result<>(0, msg, data, null, true);
    }

    public static <T> Result<T> success() {
        return new Result<>(0, "成功", null, null, true);
    }

    public static <T> Result<T> success(String msg) {
        return new Result<>(0, msg, null, null, true);
    }

    public static <T> Result<T> fail(String msg, String errorMsg) {
        return new Result<>(400, msg, null, errorMsg, false);
    }

    public static <T> Result<T> fail(String msg) {
        return new Result<>(400, msg, null, "失败", false);
    }

    public static <T> Result<T> fail(String msg, T data) {
        return new Result<>(-1, msg, data, "失败", false);
    }

    public static <T> Result<T> fail() {
        return new Result<>(400, "失败", null, "失败", false);
    }

    public static <T> Result<T> error() {
        return new Result<>(500, "服务发生错误", null, "内部服务错误", false);
    }

    public static <T> Result<T> error(String msg, String errMsg) {
        return new Result<>(500, msg, null, errMsg, false);
    }

    public static <T> Result<T> notFound() {
        return new Result<>(404, "未找到数据", null, "未找到", false);
    }

    public static <T> Result<T> unauthorized() {
        return new Result<>(401, "无权限", null, "未授权", false);
    }

    public static <T> Result<T> unauthorized(String msg) {
        return new Result<>(401, msg, null, "未授权", false);
    }

    public String toJson() {
        return JSON.toJSONString(this);
    }

}
