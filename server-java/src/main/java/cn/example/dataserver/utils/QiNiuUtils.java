package cn.example.dataserver.utils;

import com.qiniu.common.QiniuException;
import com.qiniu.storage.DownloadUrl;
import com.qiniu.util.Auth;
import lombok.Builder;
import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class QiNiuUtils {

    @Value("${qiniu.access-key:}")
    private String accessKey;

    @Value("${qiniu.secret-key:}")
    private String secretKey;

    @Value("${qiniu.bucket:}")
    private String bucket;

    @Value("${qiniu.domain}")
    private String domain;

    @Value("${qiniu.cdn-domain}")
    private String cdnDomain;

    @Value("${qiniu.upload-url}")
    private String uploadUrl;

    public UploadInfo getUploadToken() {
        Auth auth = Auth.create(accessKey, secretKey);
        String uploadToken = auth.uploadToken(bucket);
        return UploadInfo.builder()
                .uploadToken(uploadToken)
                .uploadUrl(uploadUrl)
                .domain(domain)
                .cdnDomain(cdnDomain)
                .build();
    }

    public UploadInfo getReUploadToken(String fileName) {
        Auth auth = Auth.create(accessKey, secretKey);
        String uploadToken =  auth.uploadToken(bucket, fileName);
        return UploadInfo.builder()
                .uploadToken(uploadToken)
                .uploadUrl(uploadUrl)
                .domain(domain)
                .cdnDomain(cdnDomain)
                .build();
    }

    public String getUrl(String fileName, boolean cdn) throws QiniuException {
        if(cdn) {
            return new DownloadUrl(cdnDomain, false, fileName).buildURL();
        }
        return new DownloadUrl(domain, false, fileName).buildURL();
    }

    @Data
    @Builder
    public static class UploadInfo {
        private String uploadToken;
        private String uploadUrl;
        private String domain;
        private String cdnDomain;
    }
}
