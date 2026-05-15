package cn.example.dataserver.controller;

import cn.example.dataserver.services.SystemNoticeFacadeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin
@RestController
@RequestMapping("/system-notice")
@RequiredArgsConstructor
public class SystemNoticeController {

    private final SystemNoticeFacadeService systemNoticeFacadeService;

    @GetMapping("/list")
    public String list(@RequestHeader("Authorization") String token,
                       @RequestParam(required = false) Long page,
                       @RequestParam(required = false) Long size) {
        return systemNoticeFacadeService.list(token, page, size);
    }

    @GetMapping("/unread-count")
    public String unreadCount(@RequestHeader("Authorization") String token) {
        return systemNoticeFacadeService.unreadCount(token);
    }

    @PostMapping("/read/{id}")
    public String read(@RequestHeader("Authorization") String token,
                       @PathVariable String id) {
        return systemNoticeFacadeService.readOne(token, id);
    }

    @PostMapping("/read-all")
    public String readAll(@RequestHeader("Authorization") String token) {
        return systemNoticeFacadeService.readAll(token);
    }
}
