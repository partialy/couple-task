package cn.example.dataserver.controller;

import cn.example.dataserver.services.AuthService;
import cn.example.dataserver.services.BindingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin
@RestController
@RequestMapping("/binding")
@RequiredArgsConstructor
public class BindingController {

    private final BindingService bindingService;
    private final AuthService authService;

    @PostMapping("/invite")
    public String invite(@RequestHeader("Authorization") String token, @RequestBody Map<String, String> body) {
        String inviteCode = body.get("inviteCode");
        return bindingService.invite(authService.checkToken(token), inviteCode);
    }

    @GetMapping("/received")
    public String getReceivedInvites(@RequestHeader("Authorization") String token) {
        return bindingService.getReceivedInvites(authService.checkToken(token));
    }

    @GetMapping("/sent")
    public String getSentInvites(@RequestHeader("Authorization") String token) {
        return bindingService.getSentInvites(authService.checkToken(token));
    }

    @PostMapping("/accept")
    public String accept(@RequestHeader("Authorization") String token, @RequestBody Map<String, String> body) {
        String inviteId = body.get("inviteId");
        return bindingService.accept(authService.checkToken(token), inviteId);
    }

    @PostMapping("/reject")
    public String reject(@RequestHeader("Authorization") String token, @RequestBody Map<String, String> body) {
        String inviteId = body.get("inviteId");
        return bindingService.reject(authService.checkToken(token), inviteId);
    }
}
