package cn.example.dataserver.controller;

import cn.example.dataserver.dto.MomentAddDTO;
import cn.example.dataserver.dto.MomentCommentAddDTO;
import cn.example.dataserver.services.MomentsServiceImplements;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 绑定维度「我们的动态」
 */
@CrossOrigin
@RestController
@RequestMapping("/moments")
@RequiredArgsConstructor
public class MomentsController {

    private final MomentsServiceImplements momentsServiceImplements;

    @GetMapping("/list")
    public String list(@RequestHeader("Authorization") String token,
                       @RequestParam String bindId) {
        return momentsServiceImplements.list(token, bindId);
    }

    @PostMapping("/add")
    public String add(@RequestHeader("Authorization") String token,
                      @RequestBody MomentAddDTO dto) {
        return momentsServiceImplements.add(token, dto);
    }

    @PostMapping("/like/{momentId}")
    public String toggleLike(@RequestHeader("Authorization") String token,
                             @RequestParam String bindId,
                             @PathVariable String momentId) {
        return momentsServiceImplements.toggleLike(token, bindId, momentId);
    }

    @PostMapping("/comment/add")
    public String addComment(@RequestHeader("Authorization") String token,
                             @RequestBody MomentCommentAddDTO dto) {
        return momentsServiceImplements.addComment(token, dto);
    }

    @GetMapping("/comments")
    public String listComments(@RequestHeader("Authorization") String token,
                               @RequestParam String bindId,
                               @RequestParam String momentId) {
        return momentsServiceImplements.listComments(token, bindId, momentId);
    }
}
