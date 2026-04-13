package cn.example.dataserver.dto;

import java.util.List;
import lombok.Data;

@Data
public class MomentListItemVO {

    private String id;

    private String authorUserId;

    private String userName;

    private String avatar;

    private Long createdAt;

    private String content;

    private List<String> images;

    private int likes;

    private boolean likedByMe;

    private int commentCount;
}
