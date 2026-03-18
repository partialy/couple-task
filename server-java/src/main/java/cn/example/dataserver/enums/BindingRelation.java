package cn.example.dataserver.enums;

import lombok.Getter;

@Getter
public enum BindingRelation {
    ACCEPTED("ACCEPTED", "已接受"),
    REJECTED("REJECTED", "已拒绝"),
    PENDING("PENDING", "待回应"),
    BROKEN("BROKEN", "已解除");

    private final String value;
    private final String desc;

    BindingRelation(String value, String desc) {
        this.desc = desc;
        this.value = value;
    }
}
