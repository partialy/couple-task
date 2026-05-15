package cn.example.dataserver.admin.common;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AdminPageResponse<T> {
    private List<T> list;
    private Long page;
    private Long pageSize;
    private Long total;
    private Long totalPages;
}
