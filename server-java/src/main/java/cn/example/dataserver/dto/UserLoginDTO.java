package cn.example.dataserver.dto;

import cn.example.dataserver.entity.BindingRelations;
import cn.example.dataserver.entity.Users;
import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class UserLoginDTO {
    private Users user;
    private String token;
    private BindingRelations bindingRelations;
}
