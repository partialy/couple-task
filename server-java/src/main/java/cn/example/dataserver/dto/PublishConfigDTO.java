package cn.example.dataserver.dto;

import cn.example.dataserver.entity.Categories;
import cn.example.dataserver.entity.Tags;
import cn.example.dataserver.entity.TaskLevels;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class PublishConfigDTO {
    private List<Tags> tags;
    private List<Categories> categories;
    private List<TaskLevels> taskLevels;
}
