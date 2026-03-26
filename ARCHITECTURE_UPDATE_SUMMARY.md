# EasyLink SaaS 平台架构更新总结

## 更新时间
2026-03-26

---

## 1. 文件系统整理

### 已归档（已弃用）
以下文件夹已移动到 `C:\Users\Owner\Cloudflare\.archive\20260326\`：

| 文件夹 | 大小 | 说明 |
|--------|------|------|
| `kingchicken_OLD` | 400.36 MB | 旧版 KC 系统 |
| `UpayClient_OLD` | 0.35 MB | 早期模板 |
| `upay-client-kc_OLD` | 27.09 MB | 早期 KC 客户端 |

### 新的文件系统结构

```
Cloudflare/
│
├── Easylink/                          # SaaS 平台核心
│   ├── agent-portal/                  # 代理商门户 ⭐新增
│   │   ├── index.html                 # 代理商控制台
│   │   ├── new-application.html       # 商户入网申请 ⭐新增
│   │   └── login.html
│   │
│   ├── super-admin/                   # 超管后台
│   ├── templates/                     # 商户模板 ⭐新增
│   │   └── merchant-template/         # 基于 KC 的模板
│   │       ├── README.md              # 模板使用说明 ⭐新增
│   │       ├── index.html
│   │       ├── admin.html
│   │       ├── boss-report.html
│   │       └── drivers.html           # ⚠️ KC 特有
│   │
│   ├── saas-platform-overview.html    # 架构文档 ⭐更新
│   └── ARCHITECTURE_UPDATE_SUMMARY.md # 本文件 ⭐新增
│
├── king-chicken-v2/                   # KC（首个商户）
│   ├── apps/worker/                   # 【共享】Worker API
│   └── clients/kingchicken/           # KC 专属客户端
│       ├── index.html                 # 支付页面
│       ├── login.html                 # 登录
│       ├── admin.html                 # 交易记录（三TAB）⭐更新
│       ├── boss-report.html           # 老板报告（WhatsApp）⭐更新
│       └── drivers.html               # 司机管理 ⚠️ KC特有 ⭐标注
│
└── Upay/                              # 对外品牌
```

---

## 2. Agent Portal（代理商门户）⭐ 新增

### 功能模块

| 页面 | 功能 | 路径 |
|------|------|------|
| 总览 Dashboard | 查看旗下商户概况、快速操作 | `agent-portal/index.html` |
| 我的商户 | 管理所有商户、查看详情 | `agent-portal/index.html#merchants` |
| 入网申请 | 提交新商户资料 | `agent-portal/index.html#applications` |
| **新申请表单** | **基于银联商务准则的资料收集** | `agent-portal/new-application.html` ⭐ |
| 佣金业绩 | 查看收入统计 | `agent-portal/index.html#commissions` |
| 资料库 | 入网文件清单、模板下载 | `agent-portal/index.html#documents` |

### 商户入网申请表单（银联商务要求）

根据图片中的银联商务入网准则，表单包含以下部分：

1. **基本信息**
   - 商户全称、简称
   - 商户类型（有限公司/个体户等）
   - 行业类型（餐饮/零售等）
   - 商业登记证号码

2. **联系人信息**
   - 法定代表人/董事信息
   - 日常联系人信息
   - ⚠️ 实益拥有人声明（持股25%以上）

3. **公司文件上传**
   - 商业登记证 ⭐
   - 公司注册证明书（有限公司）
   - 公司周年申报表
   - 公司章程
   - 董事身份证/护照 ⭐
   - 实益拥有人身份证明
   - 银行流水证明（最近3个月）
   - 经营场所现场照片 ⭐

4. **经营信息**
   - 网站/APP URL
   - 业务模式说明
   - 预计月交易额
   - 平均单笔交易金额

5. **结算信息**
   - 结算银行账户
   - 银行证明文件

6. **声明与提交**
   - 资料真实性声明
   - 服务协议同意

---

## 3. 权限架构

### 三级权限体系

```
┌─────────────────────────────────────────────────────┐
│  Level 1: Super Admin (平台管理员)                    │
│  - 管理所有代理商和商户                               │
│  - 审核商户入网申请                                   │
│  - 系统配置和费率设置                                 │
└─────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│  Level 2: Agent (代理商)                             │
│  - 查看自己旗下商户                                   │
│  - 提交新商户申请                                     │
│  - 查看自己的佣金业绩                                 │
│  - ❌ 不能查看其他代理商数据                          │
└─────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│  Level 3: Merchant (商户)                            │
│  - 管理自己的支付系统                                 │
│  - 查看自己的交易记录                                 │
│  - ❌ 不能查看其他商户数据                            │
└─────────────────────────────────────────────────────┘
```

---

## 4. KC 特有功能标注 ⚠️

### drivers.html - 司机管理

**这是 King Chicken 特有的功能！**

在 `C:\Users\Owner\Cloudflare\king-chicken-v2\clients\kingchicken\drivers.html` 中已添加以下标注：

```javascript
// KC-SPECIFIC: 司机管理页面
// 这是 King Chicken 特有的功能 - 配送场景下的收款节点管理
// 其他商户类型需替换为：
// - 餐饮（非配送）: 桌台管理 / 服务员管理
// - 零售: 店员管理 / 门店管理  
// - 电商: 渠道管理
// - 其他: 可在 config.js 中禁用此功能
```

### 其他商户的替换方案

| 商户类型 | drivers.html 替换为 | 说明 |
|----------|---------------------|------|
| 餐饮（非配送） | 桌台管理 / 服务员管理 | 按桌台或服务区域统计 |
| 零售 | 店员管理 / 门店管理 | 按店员或门店统计业绩 |
| 电商 | 渠道管理 | 按渠道（网站/App/小程序）统计 |
| 其他 | 禁用此功能 | 在 config.js 中设置 `features.drivers: false` |

---

## 5. 商户模板（_dummy）

### 创建位置
`C:\Users\Owner\Cloudflare\Easylink\templates\merchant-template\`

### 包含文件
- `README.md` - 模板使用说明
- `index.html` - 支付页面
- `login.html` - 登录页
- `admin.html` - 管理后台（含三TAB导航）
- `boss-report.html` - 老板报告
- `drivers.html` - ⚠️ 需根据业务类型修改
- `config.js` - 商户配置文件（需创建）

### 使用方法
1. 复制 `merchant-template` 文件夹
2. 重命名为 `clients\{商户代码}`
3. 修改 `config.js` 中的商户配置
4. 替换 logo 图片
5. 根据业务类型修改/禁用 `drivers.html`
6. 部署到 Cloudflare Pages

---

## 6. Admin 三 TAB 导航 ⭐ 更新

所有管理后台页面（admin.html, boss-report.html, drivers.html）已统一导航：

```
┌─────────────────────────────────────────────────────┐
│  [交易记录]  [管理者报告]  [司机管理]                  │
└─────────────────────────────────────────────────────┘
```

- **交易记录** (admin.html): 查看交易明细、筛选、导出
- **管理者报告** (boss-report.html): WhatsApp 自动报告、业绩统计
- **司机管理** (drivers.html): ⚠️ KC特有，管理配送司机

---

## 7. 后续计划

### Phase 1: 完善 Agent Portal
- [ ] 接入后端 API，实现真正的数据提交
- [ ] 添加文件上传功能（对接云存储）
- [ ] 实现申请状态追踪

### Phase 2: _dummy 模板配置化
- [ ] 创建 config.js 配置文件
- [ ] 提取所有可变内容到配置
- [ ] 编写新商户开通脚本

### Phase 3: 一键开通
- [ ] 开发自动化脚本
- [ ] 输入商户信息 → 生成客户端 → 自动部署
- [ ] 测试并优化流程

### Phase 4: 全面推广
- [ ] 培训代理商使用 Agent Portal
- [ ] 拓展 100+ 商户
- [ ] 持续优化平台功能

---

## 8. 关键理解

### 为什么 KC 在 `clients\kingchicken` 而不是根目录？

```
king-chicken-v2/
├── apps/worker/              # 【共享】所有商户共用同一个 Worker
│   └── src/index.js          # 统一 API，通过 merchantCode 区分
│
└── clients/kingchicken/      # 【KC专属】独立部署的客户端
    └── *.html                # 独立的 Pages 项目，独立域名
```

**关键点：**
1. `clients` = 商户客户端实例（Merchant Client Instance）
2. 每个商户有自己的 `clients\{商户}` 文件夹
3. 独立部署到 Cloudflare Pages，拥有独立域名
4. 所有商户共享同一个 Worker API
5. 数据在数据库层隔离

### KC 的双重身份
- **客户**：使用支付系统的商户
- **标杆**：第一个商户，用于开发和测试新功能
- **模板**：成功经验复制给其他 99 个商户

---

## 9. 部署检查清单

### 部署 Agent Portal
```bash
cd C:\Users\Owner\Cloudflare\Easylink\agent-portal
wrangler pages deploy . --project-name=easylink-agent-portal
```

### 部署 KC 更新
```bash
cd C:\Users\Owner\Cloudflare\king-chicken-v2\clients\kingchicken
wrangler pages deploy . --project-name=easylink-client-kingchicken
```

### 检查清单
- [ ] Agent Portal 所有页面可正常访问
- [ ] KC 三 TAB 导航正常切换
- [ ] drivers.html 已标注 KC-SPECIFIC
- [ ] 模板文件已复制到 templates\merchant-template
- [ ] 旧项目已归档到 .archive\20260326

---

**文档维护者**: 系统架构师  
**最后更新**: 2026-03-26
