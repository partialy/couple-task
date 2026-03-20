package cn.example.dataserver.enums;

import lombok.Getter;

@Getter
public enum ItemStatus {
    USABLE("usable","可使用"),
    UNUSED("unused","未使用"),
    BANNED("banned","已作废"),
    USED("used","已使用");

    private final String value;
    private final String desc;

    ItemStatus(String value, String desc) {
        this.desc = desc;
        this.value = value;
    }
}
