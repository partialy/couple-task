package cn.example.dataserver.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtBuilder;
import io.jsonwebtoken.Jwts;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;
import java.util.Date;
import java.util.UUID;

public class JwtUtil {
    
    // JWT 签名密钥
    private static final String JWT_KEY = "eWlwYW52Ml9zZWNyZXRfa2V5X2Zvcl9qd3RfdG9rZW5fZ2VuZXJhdGlvbl9hbmRfdmVyaWZpY2F0aW9u";
    
    /**
     * 生成JWT令牌
     *
     * @param subject 令牌主题（通常是用户ID或其他标识）
     * @param ttlMillis 令牌有效期（毫秒）
     * @return JWT令牌字符串
     */
    public static String createToken(String subject, Long ttlMillis) {
        SecretKey secretKey = generalKey();
        
        long nowMillis = System.currentTimeMillis();
        Date now = new Date(nowMillis);
        
        if (ttlMillis == null) {
            ttlMillis = 1000 * 60 * 60 * 24L; // 默认24小时
        }
        
        long expMillis = nowMillis + ttlMillis;
        Date exp = new Date(expMillis);
        
        JwtBuilder builder = Jwts.builder()
                .id(UUID.randomUUID().toString()) // 设置唯一标识符 (ID)
                .subject(subject) // 设置主题
                .issuer("Partial") // 设置签发者
                .issuedAt(now) // 设置签发时间
                .signWith(secretKey) // 使用HS256对称加密算法签名
                .expiration(exp); // 设置过期时间
        
        return builder.compact();
    }
    
    /**
     * 生成加密密钥
     *
     * @return 加密密钥
     */
    private static SecretKey generalKey() {
        byte[] encodedKey = Base64.getDecoder().decode(JWT_KEY);
        return new SecretKeySpec(encodedKey, 0, encodedKey.length, "HmacSHA256");
    }
    
    /**
     * 解析JWT令牌
     *
     * @param jwt 令牌字符串
     * @return Claims对象，包含令牌中的信息
     */
    public static Claims parseToken(String jwt) {
        jwt = jwt.replace("Bearer ", "");
        SecretKey secretKey = generalKey();
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(jwt)
                .getPayload();
    }
    
    /**
     * 从令牌中获取用户ID
     *
     * @param token JWT令牌
     * @return 用户ID
     */
    public static String getSubjectFromToken(String token) {
        try {
            Claims claims = parseToken(token);
            return claims.getSubject();
        } catch (Exception e) {
            return null;
        }
    }
    
    /**
     * 验证令牌是否有效
     *
     * @param token JWT令牌
     * @return 是否有效
     */
    public static boolean validateToken(String token) {
        try {
            Claims claims = parseToken(token);
            Date expiration = claims.getExpiration();
            return expiration.after(new Date());
        } catch (Exception e) {
            return false;
        }
    }
}