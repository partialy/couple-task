package cn.example.dataserver.services;

import cn.example.dataserver.entity.SystemConfig;
import cn.example.dataserver.service.SystemConfigService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class SystemConfigManager {

    // 使用ConcurrentHashMap确保线程安全
    private final Map<String, SystemConfig> configCache = new ConcurrentHashMap<>();
    private final SystemConfigService configRepository;
    private final ObjectMapper objectMapper;

    /**
     * 应用启动后执行，一次性加载所有有效的配置项到内存缓存中
     */
    @PostConstruct
    public void loadAllConfigs() {
        reload();
    }

    /**
     * 重新从数据库加载所有配置项，刷新内存缓存。
     * 可以通过外部触发（例如一个管理接口）来调用此方法。
     */
    public synchronized void reload() {
        log.info("开始从数据库重新加载所有系统配置...");
        try {
            // 从数据库查询所有启用的配置项
            var configsFromDb = configRepository.list();
            // 清空旧的缓存
            configCache.clear();
            // 将新的配置项填充到缓存中
            for (SystemConfig config : configsFromDb) {
                configCache.put(config.getConfigKey(), config);
            }
            log.info("成功从数据库加载了 {} 个系统配置项到内存。", configCache.size());
        } catch (Exception e) {
            log.error("从数据库加载系统配置失败！请检查数据库连接和表结构。", e);
            throw new RuntimeException("初始化配置失败", e); // 阻止应用启动
        }
    }

    /**
     * 获取配置值，如果不存在或未启用，则返回默认值。
     *
     * @param key          配置项的键
     * @param defaultValue 当配置项不存在或无效时返回的默认值
     * @return 配置项的值或默认值
     */
    public String getValueOrDefault(String key, String defaultValue) {
        SystemConfig config = configCache.get(key);
        if (config != null && config.getIsEnabled() == 1) {
            return config.getConfigValue();
        }
        return defaultValue;
    }

    /**
     * 获取配置值，如果不存在或未启用，则返回null。
     *
     * @param key 配置项的键
     * @return 配置项的值，如果不存在则返回null
     */
    public String getValue(String key) {
        return getValueOrDefault(key, null);
    }

    /**
     * 获取配置值，并尝试将其转换为Integer类型。
     * 如果转换失败或配置不存在，则返回默认值。
     *
     * @param key          配置项的键
     * @param defaultValue 当配置项不存在、无效或转换失败时返回的默认值
     * @return 解析后的Integer值或默认值
     */
    public Integer getIntegerValueOrDefault(String key, Integer defaultValue) {
        String value = getValue(key);
        if (value != null) {
            try {
                return Integer.parseInt(value);
            } catch (NumberFormatException e) {
                log.warn("配置项 '{}' 的值 '{}' 不是有效的整数，将返回默认值。", key, value);
            }
        }
        return defaultValue;
    }

    /**
     * 获取配置值，并尝试将其转换为 Boolean 类型。
     * 如果转换失败或配置不存在，则返回默认值。
     * 注意：数据库中布尔值通常存储为 "true"/"false" 字符串。
     *
     * @param key          配置项的键
     * @param defaultValue 当配置项不存在、无效或转换失败时返回的默认值
     * @return 解析后的 Boolean 值或默认值
     */
    public Boolean getBooleanValueOrDefault(String key, Boolean defaultValue) {
        String value = getValue(key);
        if (value != null) {
            // 使用 toLowerCase() 确保 "True", "TRUE" 等也能被正确识别
            return Boolean.parseBoolean(value.toLowerCase());
        }
        return defaultValue;
    }

    /**
     * 获取配置值，并尝试将其作为JSON反序列化为指定的Java对象。
     * 如果反序列化失败或配置不存在，则返回默认值。
     *
     * @param key           配置项的键
     * @param defaultValue  当配置项不存在、无效或反序列化失败时返回的默认值
     * @param targetClass   目标Java类的Class对象
     * @param <T>           泛型，代表目标对象类型
     * @return 反序列化后的对象或默认值
     */
    public <T> T getJsonValueOrDefault(String key, T defaultValue, Class<T> targetClass) {
        String jsonValue = getValue(key);
        if (jsonValue != null && !jsonValue.isBlank()) {
            try {
                return objectMapper.readValue(jsonValue, targetClass);
            } catch (JsonProcessingException e) {
                log.warn("配置项 '{}' 的值 '{}' 不是有效的JSON，或无法反序列化为目标类型 '{}', 将返回默认值。",
                        key, jsonValue, targetClass.getSimpleName(), e);
            }
        }
        return defaultValue;
    }

    /**
     * 检查某个配置项是否存在且已启用
     * @param key 配置项的键
     * @return 存在且启用返回true，否则返回false
     */
    public boolean existsAndEnabled(String key) {
        SystemConfig config = configCache.get(key);
        return config != null && config.getIsEnabled() == 1;
    }

    /**
     * 获取缓存中配置项的总数
     * @return 缓存中的配置数量
     */
    public int getCachedConfigCount() {
        return configCache.size();
    }
}
