package cn.example.dataserver.dto;

import lombok.Data;

/**
 * 日记新增/更新参数
 */
@Data
public class DiaryDTO {

    /**
     * 日记所属日期，格式 yyyy-MM-dd
     */
    private String entryDate;

    /**
     * 心情标识
     */
    private String mood;

    /**
     * 日记正文
     */
    private String content;

    /**
     * 配图地址
     */
    private String imageUrl;
}
