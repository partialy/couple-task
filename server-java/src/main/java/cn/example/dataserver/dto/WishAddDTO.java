package cn.example.dataserver.dto;

import lombok.Data;

/**
 * 许下心愿请求体
 */
@Data
public class WishAddDTO {

    private String bindId;

    private String content;

    private String colorKey;
}
