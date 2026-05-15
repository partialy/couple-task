package cn.example.dataserver.controller;

import cn.example.dataserver.dto.WishAddDTO;
import cn.example.dataserver.services.WishServiceImplements;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 心愿瓶接口
 */
@CrossOrigin
@RestController
@RequestMapping("/wish")
@RequiredArgsConstructor
public class WishController {

    private final WishServiceImplements wishServiceImplements;

    @GetMapping("/summary")
    public String summary(@RequestHeader("Authorization") String token,
                          @RequestParam String bindId) {
        return wishServiceImplements.summary(token, bindId);
    }

    @GetMapping("/listMine")
    public String listMine(@RequestHeader("Authorization") String token,
                           @RequestParam String bindId,
                           @RequestParam(required = false, defaultValue = "false") String includeHidden) {
        return wishServiceImplements.listMine(token, bindId, includeHidden);
    }

    @GetMapping("/listPartnerPending")
    public String listPartnerPending(@RequestHeader("Authorization") String token,
                                     @RequestParam String bindId) {
        return wishServiceImplements.listPartnerPending(token, bindId);
    }

    @PostMapping("/add")
    public String add(@RequestHeader("Authorization") String token,
                      @RequestBody WishAddDTO dto) {
        return wishServiceImplements.add(token, dto);
    }

    @PostMapping("/pick")
    public String pick(@RequestHeader("Authorization") String token,
                       @RequestParam String bindId) {
        return wishServiceImplements.pick(token, bindId);
    }

    @PostMapping("/keep/{id}")
    public String keep(@RequestHeader("Authorization") String token,
                       @PathVariable String id) {
        return wishServiceImplements.keep(token, id);
    }

    @PostMapping("/putBack/{id}")
    public String putBack(@RequestHeader("Authorization") String token,
                          @PathVariable String id) {
        return wishServiceImplements.putBack(token, id);
    }

    @PostMapping("/delete/{id}")
    public String delete(@RequestHeader("Authorization") String token,
                         @PathVariable String id) {
        return wishServiceImplements.deleteWish(token, id);
    }

    @PostMapping("/hideRecord/{id}")
    public String hideRecord(@RequestHeader("Authorization") String token,
                             @PathVariable String id) {
        return wishServiceImplements.hideRecord(token, id);
    }

    @PostMapping("/unhideRecord/{id}")
    public String unhideRecord(@RequestHeader("Authorization") String token,
                               @PathVariable String id) {
        return wishServiceImplements.unhideRecord(token, id);
    }
}
