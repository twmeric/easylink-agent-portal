# EasyLink 部署记录

**维护者**: 系统架构师  
**创建日期**: 2026-03-26  
**更新频率**: 每次部署后更新

---

## 部署记录表

### 2026-03-26 部署

| 时间 | 组件 | 版本 | 操作类型 | 部署人 | 状态 |
|------|------|------|----------|--------|------|
| 2026-03-26 23:58 | Agent Portal | v1.0 | 首次部署 | 系统架构师 | ✅ 成功 |
| 2026-03-26 23:59 | KC Client | v2.1 | 更新部署 | 系统架构师 | ✅ 成功 |

#### 部署详情

**Agent Portal 首次部署**
```bash
# 创建项目
wrangler pages project create easylink-agent-portal --production-branch=main

# 部署
cd C:\Users\Owner\Cloudflare\Easylink\agent-portal
wrangler pages deploy . --commit-dirty=true
```

- **部署 URL**: https://c170edee.easylink-agent-portal.pages.dev
- **别名 URL**: https://master.easylink-agent-portal.pages.dev
- **生产域名**: https://easylink-agent-portal.pages.dev
- **文件数**: 2 个文件
- **备注**: 首次部署，包含代理商控制台和商户入网申请表单

**King Chicken 客户端更新部署**
```bash
cd C:\Users\Owner\Cloudflare\king-chicken-v2\clients\kingchicken
wrangler pages deploy . --commit-dirty=true
```

- **部署 URL**: https://7cd16c40.easylink-client-kingchicken.pages.dev
- **别名 URL**: https://master.easylink-client-kingchicken.pages.dev
- **生产域名**: https://easylink-client-kingchicken.pages.dev
- **文件数**: 7 个文件（4 个新文件，3 个更新）
- **更新内容**:
  - ✅ 添加三 TAB 导航（交易记录、管理者报告、司机管理）
  - ✅ 更新 boss-report.html（WhatsApp 自动报告）
  - ✅ 更新 drivers.html（KC 特有功能标注）
  - ✅ 更新 admin.html（添加导航菜单）

---

## 部署检查清单

### 部署前检查
- [ ] 代码已提交到 Git
- [ ] 所有配置文件已更新
- [ ] 测试环境已通过
- [ ] 数据库迁移脚本已准备（如需要）

### 部署中检查
- [ ] 部署命令执行成功
- [ ] 无错误日志
- [ ] 文件上传完整

### 部署后检查
- [ ] 生产环境 URL 可访问
- [ ] 核心功能测试通过
- [ ] 无 Console 错误
- [ ] 文档已更新

---

## 回滚记录

| 时间 | 组件 | 回滚原因 | 回滚版本 | 操作人 |
|------|------|----------|----------|--------|
| 无 | - | - | - | - |

---

## 部署脚本备份

### Agent Portal 部署
```powershell
cd "C:\Users\Owner\Cloudflare\Easylink\agent-portal"
wrangler pages deploy . --commit-dirty=true
```

### KC Client 部署
```powershell
cd "C:\Users\Owner\Cloudflare\king-chicken-v2\clients\kingchicken"
wrangler pages deploy . --commit-dirty=true
```

### Worker 部署
```powershell
cd "C:\Users\Owner\Cloudflare\king-chicken-v2\apps\worker"
wrangler deploy
```

---

## 环境信息

### 生产环境

| 组件 | 域名 | 类型 | 状态 |
|------|------|------|------|
| Agent Portal | easylink-agent-portal.pages.dev | Pages | ✅ 运行中 |
| KC Client | easylink-client-kingchicken.pages.dev | Pages | ✅ 运行中 |
| Worker API | easylink-api-v2.jimsbond007.workers.dev | Worker | ✅ 运行中 |
| Database | easylink-db-v2 | D1 | ✅ 运行中 |

### 测试环境

| 组件 | 域名 | 类型 | 状态 |
|------|------|------|------|
| 暂无 | - | - | - |

---

### 2026-03-26 后续部署

| 时间 | 组件 | 版本 | 操作类型 | 部署人 | 状态 |
|------|------|------|----------|--------|------|
| 2026-03-26 08:00 | KC Client | v2.1 | Production 修复部署 | 系统架构师 | ✅ 成功 |
| 2026-03-26 08:15 | Worker API | v2.2 | Agent API 新增 | 系统架构师 | ✅ 成功 |

#### KC Client Production 修复
**问题**: 代码部署到了 Preview 而非 Production

**解决**:
```bash
git checkout -b production
git push origin production
cd clients/kingchicken
wrangler pages deploy . --branch=production
```

**验证**:
- ✅ https://easylink-client-kingchicken.pages.dev/admin.html
- ✅ https://easylink-client-kingchicken.pages.dev/boss-report.html
- ✅ https://easylink-client-kingchicken.pages.dev/drivers.html

#### Worker API 更新
**新增端点**:
- `/api/agent/login` - Agent 登录
- `/api/agent/dashboard` - Dashboard 统计
- `/api/agent/merchants` - 商户列表
- `/api/agent/applications` - 申请管理

**备注**: Agent Portal 后端 API 已完成，数据库表需手动创建

---

## 下次部署计划

| 计划日期 | 组件 | 内容 | 负责人 |
|----------|------|------|--------|
| 待定 | _dummy | 部署测试商户验证模板 | 待定 |
| 待定 | Database | 执行 Agent 表迁移 | 待定 |
| 待定 | Agent Portal | 前端接入后端 API | 待定 |

---

**最后更新**: 2026-03-26 08:15
