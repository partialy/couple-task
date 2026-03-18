package cn.example.dataserver.filter;

import cn.example.dataserver.common.BusinessException;
import cn.example.dataserver.common.Result;
import cn.example.dataserver.common.TokenErrorException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(TokenErrorException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public String handleTokenErrorException(TokenErrorException e) {
        log.error("token错误：{}", e.getMessage());
        log.error("错误堆栈：", e);
        return Result.unauthorized("token有误！").toJson();
    }

    @ExceptionHandler(BusinessException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public String handleBusinessException(BusinessException e) {
        log.error("业务出错：{}", e.getMessage());
        log.error("错误堆栈：", e);
        return Result.fail(e.getMessage()).toJson();
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public String handleException(Exception e) {
        log.error("系统出错：{}", e.getMessage());
        log.error("错误堆栈：", e);
        return Result.error("服务器错误", e.getMessage()).toJson();
    }
}
