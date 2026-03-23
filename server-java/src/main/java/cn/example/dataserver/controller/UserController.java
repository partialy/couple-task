package cn.example.dataserver.controller;

import cn.example.dataserver.dto.UserUpdateDTO;
import cn.example.dataserver.services.AuthService;
import cn.example.dataserver.services.UserInfoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final UserInfoService userInfoService;
    private final AuthService authService;

    @PostMapping("/update")
    public String update(@RequestHeader("Authorization") String token, @RequestBody UserUpdateDTO updateDTO) {
        return userInfoService.update(authService.checkToken(token), updateDTO);
    }

    @GetMapping("/detail")
    public String info(@RequestHeader("Authorization") String token) {
        return userInfoService.detail(authService.checkToken(token));
    }

    @GetMapping("/publishConfig")
    public String publishConfig(@RequestHeader("Authorization") String token, @RequestParam String bindId) {
        return userInfoService.publishConfig(authService.checkToken(token), bindId);
    }

    /** 绑定对象的资料与任务/道具/资产汇总 */
    @GetMapping("/partnerOverview")
    public String partnerOverview(@RequestHeader("Authorization") String token) {
        return userInfoService.partnerOverview(authService.checkToken(token));
    }
}
