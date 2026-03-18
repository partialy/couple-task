# Java 开发规范 Skill
## 适用场景
所有 Java 后端项目开发，严格遵循本项目的编码风格和技术栈规范。注释全使用中文，禁止英文注释

## 技术栈标准
### 基础框架
- Spring Boot 3.5.x + Java 17
- Maven 作为构建工具
- 项目结构采用标准分层架构：controller / service / entity / dto / common / config / mapper

### 依赖规范
```xml
<!-- 必选核心依赖 -->
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <optional>true</optional>
</dependency>
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-spring-boot3-starter</artifactId>
    <version>3.5.15</version>
</dependency>
<dependency>
    <groupId>com.alibaba.fastjson2</groupId>
    <artifactId>fastjson2</artifactId>
    <version>2.0.58</version>
</dependency>
<dependency>
    <groupId>cn.hutool</groupId>
    <artifactId>hutool-all</artifactId>
    <version>5.8.40</version>
</dependency>
```

## 编码风格规范
### 通用约定
1. **Lombok 注解优先**：
   - 日志使用 `@Slf4j` 注解创建 log 对象
   - 实体类使用 `@Data` + `@Builder` 注解，自动生成 getter/setter 和建造者模式
   - 依赖注入使用 `@RequiredArgsConstructor` 替代 `@Autowired`，所有注入字段采用 `private final` 修饰
   - Service 类统一使用 `@Service` 注解声明

2. **返回值规范**：
   - 统一使用 `Result<T>` 封装返回结果
   - 所有接口方法返回值类型为 `String`，调用 `result.toJson()` 返回 JSON 串
   - 统一使用 JSON 作为参数和响应格式（文件上传/下载等特殊场景除外）
   - 状态码定义：
     - 0：成功
     - 401：未授权
     - 其他非0值：错误
   - 复杂返回结果需创建专用响应类（DTO）封装，简单结果可直接使用 `Map` 封装：
     ```java
     Map<String, Object> map = new HashMap<>();
     map.put("user", user);
     map.put("token", token);
     return Result.success(map).toJson();
     ```

3. **异常处理规范**：
   - Token 验证错误直接抛出 `TokenErrorException`
   - 业务错误抛出 `BusinessException`，示例：`throw new BusinessException("用户不存在")`
   - 异常日志统一使用 `log.error("xxx出错：", e)` 记录完整异常栈
   - 使用 `@ControllerAdvice` 注解创建全局异常处理类，统一处理所有异常：
     - 捕获 `BusinessException` 返回 `Result.error(e.getMessage()).toJson()`
     - 捕获其他异常返回 `Result.error("服务异常").toJson()`
   - Controller 层无需单独处理异常，由全局异常处理器统一处理

### 分层规范
#### Controller 层
Controller 层**只负责接口路由定义和参数传递，不编写任何业务逻辑**，所有业务逻辑委托给 Service 层处理。
```java
@CrossOrigin
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/login")
    public String login(@RequestBody LoginDTO loginDTO) {
        return authService.login(loginDTO);
    }
}
```
- 所有需要登录的接口统一从 Header 获取 Authorization，调用 `authService.checkToken(token)` 解析用户
- 接口路径采用小驼峰命名，参数名与前端约定保持一致
- Controller 仅做参数转发，直接返回对应 Service 方法的执行结果

#### Service 层
Service 层**编写具体业务逻辑**，通过构造注入依赖其他 Service 和 Mapper。
```java
@Service
@RequiredArgsConstructor
public class AuthService {
    // 注入 MyBatis-Plus 生成的 Service，不写业务代码到此类
    private final UserService userService;
    // 自定义 Mapper 处理关联查询
    private final AuthServiceMapper authServiceMapper;

    public String login(LoginDTO loginDTO) {
        // 具体业务逻辑写在此处
        // 关联表查询通过自定义 Mapper 和 XML 实现
        UserInfo userInfo = authServiceMapper.getUserWithRole(loginDTO.getUsername());
        // ... 业务处理
        return Result.success(token).toJson();
    }
}
```
- 数据库基础 CRUD 依赖 MyBatis-Plus 自动生成的 XxxService，表结构变更时会重新生成，**禁止在自动生成的 Service 中编写业务代码**
- 需要关联表 JOIN 查询时，创建自定义 Mapper（如 `AuthServiceMapper.java`）和对应 XML 文件（如 `AuthServiceMapper.xml`），避免被重新生成的代码覆盖
- 数据库查询优先使用 MyBatis-Plus LambdaQueryWrapper
- 分页查询统一使用 `new Page<>(page, size)`

#### Entity 层
```java
@TableName(value ="表名")
@Data
@Builder
public class Xxx implements Serializable {
    /**
     * 字段注释
     */
    @TableId(value = "id")
    private String id;

    /**
     * 字段注释
     */
    @TableField(value = "字段名")
    private String 字段名;

    @TableField(exist = false)
    private static final long serialVersionUID = 1L;
}
```
- 主键采用 String 类型全局唯一ID
- 所有字段必须添加注释说明
- 数据库字段名使用下划线命名，Java 字段使用小驼峰命名

#### DTO 层
- 所有接口接收和返回的复杂对象统一使用 DTO 封装
- DTO 类使用 `@Data` + `@Builder` 注解
- 命名规范：XxxDTO（数据传输对象）、XxxQuery（查询参数）

### MyBatis-Plus 使用规范
1. **强制优先使用 LambdaQueryWrapper 或 lambdaQuery 方法**，禁止使用字符串硬编码字段名，避免重构时出错：
```java
// 推荐写法：lambdaQuery 链式调用
List<Categories> categoriesList = categoriesService.lambdaQuery()
        .eq(Categories::getBelongBindingId, bindId)
        .groupBy(Categories::getSortOrder)
        .orderByAsc(Categories::getSortOrder)
        .list();
```
```java
// 推荐写法：LambdaQueryWrapper 构造条件
LambdaQueryWrapper<TboptionhistoryinfoAptitude> queryWrapper = new LambdaQueryWrapper<>();
queryWrapper.eq(TboptionhistoryinfoAptitude::getRecordguid, recordGuid)
        .eq(TboptionhistoryinfoAptitude::getAuditdepartid, auditDepartId)
        .eq(TboptionhistoryinfoAptitude::getAuditstatus, 0)
        .eq(TboptionhistoryinfoAptitude::getAptitudetype, aptitudeType)
        .eq(TboptionhistoryinfoAptitude::getAuditperson, auditPerson);
if (tboptionhistoryinfoAptitudeService.count(queryWrapper) > 0) {
    tboptionhistoryinfoAptitudeService.remove(queryWrapper);
}
```
2. 查询示例：
```java
List<Xxx> list = xxxService.lambdaQuery()
        .eq(Xxx::getUserId, user.getId())
        .eq(Xxx::getStatus, "active")
        .orderByDesc(Xxx::getCreatedAt)
        .list();
```
3. 分页示例：
```java
Page<Xxx> page = xxxService.lambdaQuery()
        .eq(Xxx::getStatus, status)
        .orderByDesc(Xxx::getCreatedAt)
        .page(new Page<>(page, size));
```

### 命名规范
- 类名：大驼峰命名，见名知意
- 方法名：小驼峰命名，动词开头（get / list / add / update / delete / save）
- 常量：全大写，下划线分隔
- 数据库表名：小写字母，下划线分隔
- 接口路径：小驼峰命名，层级清晰

## 代码质量要求
1. 所有公共方法必须添加注释说明功能、参数、返回值
2. 复杂业务逻辑必须添加注释说明实现思路
3. 避免魔法值，所有常量统一在常量类中定义
4. 空值判断优先使用 Hutool 工具类：`ObjectUtil.isNull()` / `CollUtil.isEmpty()`
5. 字符串处理优先使用 Hutool 工具类：`StrUtil.isBlank()` / `StrUtil.isNotBlank()`

## 后续扩展
本规范会根据项目迭代持续更新，所有 Java 代码编写必须严格遵循本规范。
