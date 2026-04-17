package cn.example.dataserver.admin.common;

import jakarta.servlet.http.HttpServletRequest;

public final class AdminResponseFactory {
    private AdminResponseFactory() {
    }

    public static String success(HttpServletRequest request, Object data) {
        return AdminResult.success(data, AdminTraceUtil.getOrCreateTraceId(request)).toJson();
    }

    public static String success(HttpServletRequest request) {
        return AdminResult.success(AdminTraceUtil.getOrCreateTraceId(request)).toJson();
    }
}
