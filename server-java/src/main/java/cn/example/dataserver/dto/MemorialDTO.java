package cn.example.dataserver.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 纪念日创建与更新请求体
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemorialDTO {

    /**
     * 展示标题
     */
    private String title;

    /**
     * 事件类型：anniversary 或 birthday
     */
    private String eventType;

    /**
     * 预设图标 key
     */
    private String iconKey;

    /**
     * 自定义图标 URL
     */
    private String customIconUrl;

    /**
     * 主题色标识
     */
    private String colorThemeId;

    /**
     * 用户自定义分类标签
     */
    private String customCategory;

    /**
     * 生日时的姓名
     */
    private String personName;

    /**
     * 是否置顶
     */
    private Boolean pinned;

    /**
     * 类型：1=倒数日 2=纪念日（兼容旧客户端）
     */
    private Integer kind;

    /**
     * 锚点日期，格式 yyyy-MM-dd
     */
    private String anchorDate;

    /**
     * 是否每年重复
     */
    private Boolean repeatYearly;

    /**
     * 备注
     */
    private String note;

    /**
     * 排序权重
     */
    private Integer sortOrder;
}
