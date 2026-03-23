package cn.example.dataserver.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
}
