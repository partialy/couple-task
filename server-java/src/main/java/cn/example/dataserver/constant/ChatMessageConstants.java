package cn.example.dataserver.constant;

/**
 * 聊天消息类型常量，与 messages.type 字段对应
 */
public final class ChatMessageConstants {

    private ChatMessageConstants() {
    }

    /** 纯文本 */
    public static final String TYPE_TEXT = "text";
    /** 图片，content 为七牛 URL */
    public static final String TYPE_IMAGE = "image";
    /** 视频，content 为七牛 URL */
    public static final String TYPE_VIDEO = "video";
    /** 文件，content 为七牛 URL */
    public static final String TYPE_FILE = "file";
    /** 任务邀请等业务扩展类型 */
    public static final String TYPE_TASK_INVITE = "task_invite";
}
