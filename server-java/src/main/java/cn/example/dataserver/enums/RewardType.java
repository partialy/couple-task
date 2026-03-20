package cn.example.dataserver.enums;

import lombok.Getter;

@Getter
public enum RewardType {
    WILD_CARD("wild_card","万能卡"),
    POINTS("points","积分"),
    NORMAL("normal","道具");

    private final String value;
    private final String desc;

    RewardType(String value, String desc) {
        this.desc = desc;
        this.value = value;
    }
}
