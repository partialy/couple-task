package cn.example.dataserver.admin.common;

public final class AdminAuthContext {
    private static final ThreadLocal<String> ADMIN_ID_HOLDER = new ThreadLocal<>();

    private AdminAuthContext() {
    }

    public static void setAdminId(String adminId) {
        ADMIN_ID_HOLDER.set(adminId);
    }

    public static String getAdminId() {
        return ADMIN_ID_HOLDER.get();
    }

    public static void clear() {
        ADMIN_ID_HOLDER.remove();
    }
}
