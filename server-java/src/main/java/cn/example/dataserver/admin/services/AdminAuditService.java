package cn.example.dataserver.admin.services;

import cn.example.dataserver.admin.common.AdminAuthContext;
import cn.example.dataserver.admin.entity.AdminOperationLogs;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
@RequiredArgsConstructor
public class AdminAuditService {

    private final AdminOperationLogsService adminOperationLogsService;

    public void logSuccess(String module, String action, String targetType, String targetId, String requestJson) {
        saveLog(module, action, targetType, targetId, requestJson, "success");
    }

    public void logFailed(String module, String action, String targetType, String targetId, String requestJson) {
        saveLog(module, action, targetType, targetId, requestJson, "failed");
    }

    private void saveLog(
            String module, String action, String targetType, String targetId, String requestJson, String result) {
        AdminOperationLogs logs = new AdminOperationLogs();
        logs.setAdminUserId(AdminAuthContext.getAdminId());
        logs.setModule(module);
        logs.setAction(action);
        logs.setTargetType(targetType);
        logs.setTargetId(targetId);
        logs.setRequestJson(requestJson);
        logs.setResult(result);
        logs.setCreatedAt(new Date());
        adminOperationLogsService.save(logs);
    }
}
