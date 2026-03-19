package cn.example.dataserver.vo;

import lombok.Builder;
import lombok.Data;

/**
 * 发布人信息
 */
@Data
@Builder
public class PublisherVO {
    /**
     * 用户ID
     */
    private String id;

    /**
     * 昵称
     */
    private String nickname;

    /**
     * 头像
     */
    private String avatar;

    /**
     * 等级
     */
    private Integer level;

    /**
     * 称号
     */
    private String title;
}
