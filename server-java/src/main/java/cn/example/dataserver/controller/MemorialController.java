package cn.example.dataserver.controller;

import cn.example.dataserver.dto.MemorialDTO;
import cn.example.dataserver.services.MemorialServiceImplements;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 纪念日与倒数日接口
 */
@CrossOrigin
@RestController
@RequestMapping("/memorial")
@RequiredArgsConstructor
public class MemorialController {

    private final MemorialServiceImplements memorialServiceImplements;

    /**
     * 新增
     */
    @PostMapping("/add")
    public String add(@RequestHeader("Authorization") String token,
                      @RequestBody MemorialDTO dto) {
        return memorialServiceImplements.addMemorial(token, dto);
    }

    /**
     * 更新
     */
    @PostMapping("/update/{id}")
    public String update(@RequestHeader("Authorization") String token,
                         @PathVariable String id,
                         @RequestBody MemorialDTO dto) {
        return memorialServiceImplements.updateMemorial(token, id, dto);
    }

    /**
     * 删除（软删除）
     */
    @PostMapping("/delete/{id}")
    public String delete(@RequestHeader("Authorization") String token,
                         @PathVariable String id) {
        return memorialServiceImplements.deleteMemorial(token, id);
    }

    /**
     * 列表
     */
    @GetMapping("/list")
    public String list(@RequestHeader("Authorization") String token,
                       @RequestParam String bindId) {
        return memorialServiceImplements.listByBindId(token, bindId);
    }
}
