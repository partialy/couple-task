package cn.example.dataserver.dto;

import lombok.Data;

/**
 * 道具核销：输入对方背包道具的核销码
 */
@Data
public class UserItemVerifyDTO {
    private String code;
}
