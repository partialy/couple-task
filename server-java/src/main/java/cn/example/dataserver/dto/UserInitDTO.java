package cn.example.dataserver.dto;

import cn.example.dataserver.entity.BindingRelations;
import cn.example.dataserver.entity.Users;
import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class UserInitDTO {
    private BindingRelations bindingRelations;
    private Boolean isBinding;
    private Users user;
    private Users bindUser;
}
