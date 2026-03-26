# EasyLink 故障排查指南

**文档版本**: v1.0  
**创建日期**: 2026-03-26

---

## 快速诊断

### 系统状态检查清单

- [ ] Pages 站点可访问
- [ ] Worker API 响应正常
- [ ] 数据库连接正常
- [ ] 支付流程可完成
- [ ] Webhook 正常接收

---

## 常见故障

### 故障 1: Pages 站点返回 404

**现象**: 访问 `https://*.pages.dev` 返回 404 Not Found

**可能原因**:
1. 项目不存在
2. 部署失败
3. 分支配置错误

**排查步骤**:

```bash
# 1. 检查项目是否存在
wrangler pages project list

# 2. 检查部署历史
wrangler pages deployment list --project-name=easylink-agent-portal

# 3. 重新部署
cd C:\Users\Owner\Cloudflare\Easylink\agent-portal
wrangler pages deploy .
```

**解决方案**:
- 如项目不存在：创建新项目
- 如部署失败：查看错误日志，修复后重新部署
- 如分支配置错误：检查 `wrangler.toml` 或在 Dashboard 中修改

---

### 故障 2: Worker API 返回 500

**现象**: API 调用返回 500 Internal Server Error

**可能原因**:
1. 数据库连接失败
2. 代码错误
3. 环境变量缺失

**排查步骤**:

```bash
# 1. 查看实时日志
wrangler tail --name easylink-api-v2

# 2. 检查数据库状态
wrangler d1 execute easylink-db-v2 --command="SELECT 1;"

# 3. 检查环境变量
wrangler secret list
```

**常见错误及解决**:

| 错误信息 | 原因 | 解决方案 |
|----------|------|----------|
| `D1_ERROR` | 数据库连接失败 | 检查 D1 绑定配置 |
| `TypeError: Cannot read property` | 代码访问未定义变量 | 检查代码逻辑，添加空值判断 |
| `Error: Secret not found` | 环境变量缺失 | 添加缺失的 secret |

---

### 故障 3: 支付创建失败

**现象**: 点击支付按钮后无响应或报错

**排查步骤**:

1. **检查浏览器 Console**
   - 打开 F12 → Console
   - 查看是否有 JavaScript 错误

2. **检查网络请求**
   - 打开 F12 → Network
   - 查看 `/api/v1/KC/payment/create` 请求
   - 检查请求参数和响应

3. **检查 Worker 日志**
   ```bash
   wrangler tail --name easylink-api-v2
   ```

**常见错误**:

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| `CORS error` | 跨域配置错误 | 检查 Worker CORS 配置 |
| `Invalid amount` | 金额参数错误 | 检查金额是否为数字 |
| `Invalid pay type` | 支付方式错误 | 检查 payType 参数 |
| `EasyLink API error` | 上游接口错误 | 检查 EasyLink 配置 |

---

### 故障 4: Webhook 未收到回调

**现象**: 支付成功但系统未更新订单状态

**排查步骤**:

1. **检查 Webhook URL 配置**
   - 确认 notifyUrl 配置正确
   - 格式: `https://{worker}/webhook/easylink`

2. **检查 Worker 日志**
   ```bash
   wrangler tail --name easylink-api-v2 --filter="webhook"
   ```

3. **手动测试 Webhook**
   ```bash
   curl -X POST https://easylink-api-v2.jimsbond007.workers.dev/webhook/easylink \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "mchOrderNo=TEST001&status=2"
   ```

**常见问题**:
- Webhook URL 配置错误
- Worker 返回非 200 状态码
- 请求超时

---

### 故障 5: 数据库查询缓慢

**现象**: 查询响应时间过长

**排查步骤**:

```sql
-- 1. 检查表大小
SELECT COUNT(*) FROM transactions;

-- 2. 检查索引
PRAGMA index_list(transactions);

-- 3. 分析慢查询（手动测试）
SELECT * FROM transactions WHERE mchNo = '80403445499539' ORDER BY createdAt DESC LIMIT 100;
```

**优化建议**:
- 确保 `mchNo`、`createdAt`、`status` 字段有索引
- 定期清理过期数据
- 避免全表扫描

---

### 故障 6: Agent Portal 表单提交失败

**现象**: 提交商户申请后无响应

**可能原因**:
1. 后端 API 未实现（当前为前端演示版）
2. 网络错误
3. 表单验证失败

**临时解决方案**:
- 表单提交后数据会显示在 Console 中
- 手动收集数据后通过其他方式提交

---

### 故障 7: 三 TAB 导航不工作

**现象**: 点击导航按钮无法切换页面

**排查步骤**:
1. 检查文件是否存在
   - `admin.html`
   - `boss-report.html`
   - `drivers.html`

2. 检查导航链接是否正确
   ```html
   <a href="admin.html">交易记录</a>
   <a href="boss-report.html">管理者报告</a>
   <a href="drivers.html">司机管理</a>
   ```

3. 检查 JavaScript 是否有错误

---

## 紧急恢复

### 回滚到上一个版本

```bash
# 查看部署历史
wrangler pages deployment list --project-name=easylink-client-kingchicken

# Worker 回滚
wrangler rollback --name easylink-api-v2
```

### 数据库紧急恢复

```bash
# 从备份恢复
wrangler d1 execute easylink-db-v2 --file=backup-20260326.sql
```

---

## 日志分析

### Worker 日志过滤

```bash
# 只查看错误日志
wrangler tail --name easylink-api-v2 --filter="ERROR"

# 查看支付相关日志
wrangler tail --name easylink-api-v2 --filter="payment"

# 查看 webhook 日志
wrangler tail --name easylink-api-v2 --filter="webhook"
```

### 常见日志模式

| 日志模式 | 含义 | 处理方式 |
|----------|------|----------|
| `[CreatePayment]` | 创建支付请求 | 正常日志 |
| `[Webhook] Received` | 收到 Webhook | 正常日志 |
| `[Webhook] Invalid sign` | Webhook 签名错误 | 检查 EasyLink 密钥配置 |
| `[DB Error]` | 数据库错误 | 检查数据库连接和查询 |

---

## 联系支持

如以上方法无法解决问题：

1. 收集以下信息：
   - 错误截图
   - Worker 日志
   - 复现步骤

2. 查看文档：
   - [运维手册](OPERATIONS_MANUAL.md)
   - [部署记录](DEPLOYMENT_LOG.md)
   - [API 文档](API_REFERENCE.md)

---

**最后更新**: 2026-03-26
