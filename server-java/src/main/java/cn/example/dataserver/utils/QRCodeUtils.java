package cn.example.dataserver.utils;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageConfig;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

/**
 * 二维码生成工具类（修正类型不匹配问题）
 */
@Slf4j
@AllArgsConstructor
public class QRCodeUtils {
    // 二维码宽度
    private static final int WIDTH = 300;
    // 二维码高度
    private static final int HEIGHT = 300;
    // 二维码格式
    private static final String FORMAT = "PNG";

    private static String process(String content, int width, int height, String format) {
        try {
            // 1. 设置二维码配置参数
            Map<EncodeHintType, Object> hints = new HashMap<>();
            // 设置字符编码
            hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
            // 设置纠错级别（H级别容错率最高）
            hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H);
            // 设置边距（0表示无白边）
            hints.put(EncodeHintType.MARGIN, 1);

            // 2. 生成二维码矩阵
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(content, BarcodeFormat.QR_CODE, width, height, hints);

            // 3. 将矩阵转换为图片流并编码为 Base64（关键修正：使用 writeToStream 而非 writeToPath）
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageConfig config = new MatrixToImageConfig(0xFF000000, 0xFFFFFFFF); // 黑底白码
            // 修正：使用 writeToStream 方法，适配 OutputStream 类型
            MatrixToImageWriter.writeToStream(bitMatrix, format, outputStream, config); // 正确行

            // 4. 转换为 Base64 编码（注意：前端展示时需要拼接 data:image/png;base64, 前缀）
            return "data:image/png;base64," + Base64.getEncoder().encodeToString(outputStream.toByteArray());
        } catch (WriterException | IOException e) {
            log.error("生成二维码失败: {}", e.getMessage());
            return null;
        }
    }


    /**
     * 将字符串生成二维码并转换为Base64编码
     */
    public static String generateQRCodeToBase64(String content) {
        return process(content, WIDTH, HEIGHT, FORMAT);
    }
    public static String generateQRCodeToBase64(String content, String format) {
        return process(content, WIDTH, HEIGHT, format);
    }
    public static String generateQRCodeToBase64(String content, int width, int height) {
        return process(content, width, height, FORMAT);
    }
    public static String generateQRCodeToBase64(String content, int width, int height, String format) {
        return process(content, width, height, format);
    }
}