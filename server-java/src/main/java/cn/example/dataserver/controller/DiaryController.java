package cn.example.dataserver.controller;

import cn.example.dataserver.dto.DiaryCommentDTO;
import cn.example.dataserver.dto.DiaryDTO;
import cn.example.dataserver.services.DiaryServiceImplements;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 日记模块
 */
@CrossOrigin
@RestController
@RequestMapping("/diary")
@RequiredArgsConstructor
public class DiaryController {

    private final DiaryServiceImplements diaryServiceImplements;

    /**
     * 新增日记
     */
    @PostMapping("/add")
    public String add(@RequestHeader("Authorization") String token,
                      @RequestBody DiaryDTO dto) {
        return diaryServiceImplements.addDiary(token, dto);
    }

    /**
     * 更新日记
     */
    @PostMapping("/update/{id}")
    public String update(@RequestHeader("Authorization") String token,
                         @PathVariable String id,
                         @RequestBody DiaryDTO dto) {
        return diaryServiceImplements.updateDiary(token, id, dto);
    }

    /**
     * 删除日记
     */
    @PostMapping("/delete/{id}")
    public String delete(@RequestHeader("Authorization") String token,
                         @PathVariable String id) {
        return diaryServiceImplements.deleteDiary(token, id);
    }

    /**
     * 日记列表
     */
    @GetMapping("/list")
    public String list(@RequestHeader("Authorization") String token,
                       @RequestParam String bindId,
                       @RequestParam(required = false) String entryDate) {
        return diaryServiceImplements.listDiary(token, bindId, entryDate);
    }

    /**
     * 检查今天是否写过日记
     */
    @GetMapping("/checkToday")
    public String checkToday(@RequestHeader("Authorization") String token,
                             @RequestParam String bindId) {
        return diaryServiceImplements.checkTodayWritten(token, bindId);
    }

    /**
     * 切换点赞
     */
    @PostMapping("/toggle-like/{id}")
    public String toggleLike(@RequestHeader("Authorization") String token,
                             @PathVariable String id) {
        return diaryServiceImplements.toggleLike(token, id);
    }

    /**
     * 新增评论
     */
    @PostMapping("/comment/{id}")
    public String comment(@RequestHeader("Authorization") String token,
                          @PathVariable String id,
                          @RequestBody DiaryCommentDTO dto) {
        return diaryServiceImplements.addComment(token, id, dto);
    }

    /**
     * 删除评论（仅本人）
     */
    @PostMapping("/comment/delete/{id}/{commentId}")
    public String deleteComment(@RequestHeader("Authorization") String token,
                                @PathVariable String id,
                                @PathVariable String commentId) {
        return diaryServiceImplements.deleteComment(token, id, commentId);
    }
}
