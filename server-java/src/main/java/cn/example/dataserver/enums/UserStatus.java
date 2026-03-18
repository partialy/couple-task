package cn.example.dataserver.enums;

import lombok.Getter;

@Getter
public enum UserStatus {
    ACTIVE("active", "可用"),
    BLOCKED("blocked", "被封禁"),
    DELETED("deleted","已删除"),
    DISABLED("disabled","被禁用");
    private final String value;
    private final String desc;

    UserStatus(String value, String desc) {
        this.value = value;
        this.desc = desc;
    }
}
