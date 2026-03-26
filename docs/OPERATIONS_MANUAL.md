# EasyLink 运维手册

**文档版本**: v1.0  
**创建日期**: 2026-03-26  
**适用对象**: 系统管理员、运维人员

---

## 1. 系统监控

### 1.1 日常检查项

| 检查项 | 检查频率 | 正常指标 | 检查方法 |
|--------|----------|----------|----------|
| Agent Portal 可访问性 | 每日 | HTTP 200 | 访问 https://easylink-agent-portal.pages.dev |
| KC Client 可访问性 | 每日 | HTTP 200 | 访问 https://easylink-client-kingchicken.pages.dev |
| Worker API 响应 | 每日 | < 500ms | `curl https://easylink-api-v2.jimsbond007.workers.dev/health` |
| 数据库连接 | 每日 | 无错误 | 查看 Worker 日志 |

### 1.2 监控命令

```bash
# 查看 Worker 实时日志
wrangler tail --name easylink-api-v2

# 检查数据库状态
wrangler d1 execute easylink-db-v2 --command="SELECT COUNT(*) FROM transactions WHERE createdAt > strftime('%s', 'now', '-1 day');"

# 检查 Pages 部署状态
wrangler pages deployment list --project-name=easylink-agent-portal
wrangler pages deployment list --project-name=easylink-client-kingchicken
```

---

## 2. 故障处理

### 2.1 常见故障快速处理

#### 故障 1: 页面 404

**症状**: 访问 Pages 域名返回 404

**处理步骤**:
1. 检查域名是否正确
2. 检查项目是否存在
   ```bash
   wrangler pages project list
   ```
3. 检查最近部署是否成功
   ```bash
   wrangler pages deployment list --project-name={项目名}
   ```
4. 如有需要，重新部署

#### 故障 2: API 返回 500

**症状**: Worker 返回 500 错误

**处理步骤**:
1. 查看 Worker 日志
   ```bash
   wrangler tail
   ```
2. 检查数据库连接
3. 检查环境变量配置
4. 如有需要，回滚到上一个版本
   ```bash
   wrangler rollback --name easylink-api-v2
   ```

#### 故障 3: 数据库查询慢

**症状**: 查询响应时间过长

**处理步骤**:
1. 检查是否有适当的索引
2. 分析慢查询
3. 考虑添加索引或优化查询

---

## 3. 备份与恢复

### 3.1 数据库备份

```bash
# 导出数据库
wrangler d1 export easylink-db-v2 --output=backup-$(Get-Date -Format 'yyyyMMdd').sql

# 备份存储位置
# C:\Users\Owner\Cloudflare\Easylink\backups\
```

### 3.2 数据恢复

```bash
# 导入数据库（谨慎操作）
wrangler d1 execute easylink-db-v2 --file=backup-20260326.sql
```

---

## 4. 安全管理

### 4.1 访问控制

| 角色 | 访问范围 | 权限 |
|------|----------|------|
| Super Admin | 全平台 | 所有权限 |
| Agent | 旗下商户 | 查看、提交申请 |
| Merchant Admin | 本商户 | 查看交易、管理配置 |

### 4.2 密钥管理

- **Worker 密钥**: 存储在 Cloudflare Secrets
- **数据库连接**: 由 Cloudflare 自动管理
- **API 密钥**: 定期轮换（建议每 90 天）

### 4.3 安全更新

- 定期更新 Wrangler CLI
- 关注 Cloudflare 安全公告
- 及时应用安全补丁

---

## 5. 性能优化

### 5.1 Pages 优化

- 启用缓存策略
- 压缩静态资源
- 使用 CDN 加速

### 5.2 Worker 优化

- 减少不必要的 API 调用
- 使用缓存（Cache API）
- 优化数据库查询

### 5.3 数据库优化

- 确保关键字段有索引
- 定期清理过期数据
- 监控查询性能

---

## 6. 扩容计划

### 6.1 当前容量

| 指标 | 当前值 | 上限 | 备注 |
|------|--------|------|------|
| 商户数 | 1 | 无限 | Worker 支持无限商户 |
| 日交易量 | 约 100 笔 | 10万笔 | D1 免费额度 |
| 并发请求 | < 10 | 1000 | Worker 限制 |

### 6.2 扩容触发条件

- 日交易量超过 5 万笔
- 响应时间超过 1 秒（P95）
- 存储空间超过 80%

---

## 7. 维护窗口

### 7.1 计划维护

| 维护项 | 频率 | 时间窗口 | 影响 |
|--------|------|----------|------|
| 数据库备份 | 每日 | 02:00-03:00 | 无影响 |
| 日志清理 | 每周 | 周日 03:00 | 无影响 |
| 版本更新 | 每月 | 周六 02:00-04:00 | 可能有短暂中断 |

### 7.2 紧急维护

- 提前 1 小时通知用户
- 在 Agent Portal 发布公告
- 记录维护日志

---

## 8. 联系人

| 角色 | 联系人 | 联系方式 |
|------|--------|----------|
| 技术负责人 | 系统架构师 | - |
| 运维支持 | - | - |
| 客服支持 | - | - |

---

## 9. 附录

### 9.1 常用命令速查

```bash
# 部署
wrangler pages deploy . --commit-dirty=true
wrangler deploy

# 日志
wrangler tail
wrangler tail --format=pretty

# 数据库
wrangler d1 execute easylink-db-v2 --command="SQL语句"
wrangler d1 export easylink-db-v2 --output=backup.sql

# 项目信息
wrangler pages project list
wrangler pages deployment list --project-name=easylink-agent-portal

# Secrets 管理
wrangler secret list
wrangler secret put SECRET_NAME
```

### 9.2 重要 URL

| 环境 | URL |
|------|-----|
| Agent Portal | https://easylink-agent-portal.pages.dev |
| KC Client | https://easylink-client-kingchicken.pages.dev |
| API Worker | https://easylink-api-v2.jimsbond007.workers.dev |

---

**最后更新**: 2026-03-26
