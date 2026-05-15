package cn.example.dataserver.admin.filter;

import cn.example.dataserver.admin.common.AdminBusinessException;
import cn.example.dataserver.admin.common.AdminResult;
import cn.example.dataserver.admin.common.AdminTraceUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice(basePackages = "cn.example.dataserver.admin")
public class AdminGlobalExceptionHandler {

    @ExceptionHandler(AdminBusinessException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public String handleBusinessException(AdminBusinessException e, HttpServletRequest request) {
        String traceId = AdminTraceUtil.getOrCreateTraceId(request);
        log.error("[admin] business error, traceId={}, msg={}", traceId, e.getMessage(), e);
        return AdminResult.fail(40002, e.getMessage(), traceId).toJson();
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public String handleException(Exception e, HttpServletRequest request) {
        String traceId = AdminTraceUtil.getOrCreateTraceId(request);
        log.error("[admin] system error, traceId={}", traceId, e);
        return AdminResult.fail(50000, "系统异常", traceId).toJson();
    }
}
