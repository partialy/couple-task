package cn.example.dataserver.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 在线状态信息
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PresenceVO {

    /**
     * 用户 ID
     */
    private String userId;

    /**
     * 是否在线
     */
    private boolean online;
}
