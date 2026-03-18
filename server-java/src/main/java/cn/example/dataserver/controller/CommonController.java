package cn.example.dataserver.controller;

import cn.example.dataserver.common.Result;
import cn.example.dataserver.utils.QiNiuUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequestMapping("/common")
@RequiredArgsConstructor
public class CommonController {

    private final QiNiuUtils qiNiuUtils;

    @GetMapping("/qiniu/token")
    public Result<QiNiuUtils.UploadInfo> getUploadToken() {
        return Result.success(qiNiuUtils.getUploadToken());
    }
}
