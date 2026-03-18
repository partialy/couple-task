package cn.example.dataserver.dto;

import lombok.Data;
import java.util.Date;

@Data
public class UserUpdateDTO {
    private String nickname;
    private String avatar;
    private String gender;
    private Date birthday;
    private Date anniversary;
    private String location;
}
