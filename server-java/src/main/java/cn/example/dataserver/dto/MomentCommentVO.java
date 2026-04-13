package cn.example.dataserver.dto;

import lombok.Data;

@Data
public class MomentCommentVO {

    private String id;

    private String authorUserId;

    private String userName;

    private String avatar;

    private Long createdAt;

    private String content;
}
