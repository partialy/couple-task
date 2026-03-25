package cn.example.dataserver.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

/**
 * 会话对方用户简要信息
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PeerUserVO {

    private String id;
    private String nickname;
    private String avatar;
    /**
     * 对方最后登录时间
     */
    private Date lastLoginAt;
}
