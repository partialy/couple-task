package cn.example.dataserver.enums;

import lombok.Getter;

@Getter
public enum TaskStatus {
    PENDING("pending","待接取"),
    ACCEPTED("accepted","已接受"),
    IN_PROGRESS("in-progress","进行中"),
    APPLYING("applying","申请完成中"),
    COMPLETED("completed","已完成"),
    ABANDON("abandon","放弃");

    private final String value;
    private final String desc;

    TaskStatus(String value, String desc) {
        this.desc = desc;
        this.value = value;
    }
}
