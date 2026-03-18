package cn.example.dataserver.utils;

import org.springframework.util.DigestUtils;

public class PasswordEncoder {
    
    /**
     * 对密码进行MD5加密
     *
     * @param rawPassword 原始密码
     * @return 加密后的密码
     */
    public static String encode(String rawPassword) {
        if (rawPassword == null) {
            return null;
        }
        return DigestUtils.md5DigestAsHex(rawPassword.getBytes());
    }
    
    /**
     * 验证密码是否匹配
     *
     * @param rawPassword 原始密码
     * @param encodedPassword 加密后的密码
     * @return 是否匹配
     */
    public static boolean matches(String rawPassword, String encodedPassword) {
        if (rawPassword == null) {
            return encodedPassword == null;
        }
        return encode(rawPassword).equals(encodedPassword);
    }
}