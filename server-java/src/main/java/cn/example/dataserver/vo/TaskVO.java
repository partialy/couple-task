package cn.example.dataserver.vo;

import cn.example.dataserver.entity.Tasks;
import cn.example.dataserver.entity.TaskRewards;
import cn.example.dataserver.entity.TaskImages;
import com.baomidou.mybatisplus.annotation.TableField;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
public class TaskVO extends Tasks {
    /**
     * 当前用户是否已收藏（非 tasks 表字段）
     */
    @TableField(exist = false)
    private Boolean isBookmarked;

    private List<String> tags;
    private List<TaskRewards> rewards;
    private List<TaskImages> images;
    private String authorAvatar;
    private String authorName;
    private String gender;
    private String category;
    private String level;
}
