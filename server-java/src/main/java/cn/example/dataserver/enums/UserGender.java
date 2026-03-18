package cn.example.dataserver.enums;

import lombok.Getter;

@Getter
public enum UserGender {
    MALE("male", "男"),
    FEMALE("female","女"),
    OTHER("other","其他/私密");
    private final String value;
    private final String desc;
    UserGender(String value, String desc) {
        this.value = value;
        this.desc = desc;
    }
}
