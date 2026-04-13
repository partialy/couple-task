package cn.example.dataserver.dto;

import java.util.List;
import lombok.Data;

@Data
public class MomentAddDTO {

    private String bindId;

    private String content;

    /** 已上传图片 URL 列表，顺序即展示顺序 */
    private List<String> imageUrls;
}
