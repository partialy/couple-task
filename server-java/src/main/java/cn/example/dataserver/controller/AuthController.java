package cn.example.dataserver.controller;

import cn.example.dataserver.entity.Users;
import cn.example.dataserver.services.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public String login(@RequestBody Users users, @RequestParam(value = "code", required = false) String code) {
        return authService.login(users, code);
    }

    @PostMapping("/logout")
    public String logout(@RequestHeader("Authorization") String token) {
        return authService.logout(token);
    }

    @PostMapping("/refresh")
    public String refresh(@RequestHeader("Authorization") String token) {
        return authService.refresh(token);
    }

    @PostMapping("/register")
    public String register(@RequestBody Users users, @RequestParam(value = "code", required = false) String code) {
        return authService.register(users, code);
    }

    @PostMapping("/sendCode")
    public String sendCode(@RequestParam("target") String target) {
        return authService.sendCode(target);
    }
}
