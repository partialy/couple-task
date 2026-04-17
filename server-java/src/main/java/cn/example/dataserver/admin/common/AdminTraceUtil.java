package cn.example.dataserver.admin.common;

import jakarta.servlet.http.HttpServletRequest;

import java.util.UUID;

public final class AdminTraceUtil {
    private static final String TRACE_ID_HEADER = "X-Trace-Id";

    private AdminTraceUtil() {
    }

    public static String getOrCreateTraceId(HttpServletRequest request) {
        String traceId = request.getHeader(TRACE_ID_HEADER);
        if (traceId == null || traceId.isBlank()) {
            traceId = UUID.randomUUID().toString().replace("-", "");
        }
        return traceId;
    }
}
