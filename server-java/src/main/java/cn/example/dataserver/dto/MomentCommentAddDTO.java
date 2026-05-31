package cn.example.dataserver.dto;

import lombok.Data;

@Data
public class MomentCommentAddDTO {

    private String bindId;

    private String momentId;

    private String content;
}
