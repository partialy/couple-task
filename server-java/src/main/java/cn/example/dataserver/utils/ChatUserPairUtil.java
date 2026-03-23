package cn.example.dataserver.utils;

import cn.hutool.core.util.StrUtil;

/**
 * 双人会话用户 ID 规范化：按字典序将较小者作为 user1，较大者作为 user2，避免重复会话
 */
public final class ChatUserPairUtil {

    private ChatUserPairUtil() {
    }

    /**
     * 返回规范化后的 [user1Id, user2Id]
     */
    public static String[] orderedPair(String userIdA, String userIdB) {
        if (StrUtil.hasBlank(userIdA, userIdB)) {
            throw new IllegalArgumentException("用户 ID 不能为空");
        }
        if (userIdA.compareTo(userIdB) <= 0) {
            return new String[]{userIdA, userIdB};
        }
        return new String[]{userIdB, userIdA};
    }
}
