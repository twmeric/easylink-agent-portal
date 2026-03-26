# EasyLink 功能规格说明

**版本**: v2.0  
**最后更新**: 2026-03-26  
**适用平台**: EasyLink SaaS 支付平台

---

## 1. 平台概述

EasyLink 是一个 SaaS 多租户支付平台，支持：
- 代理商管理旗下商户
- 商户独立支付系统
- 统一支付网关（银联/支付宝/微信）
- 三级权限体系

---

## 2. 功能模块

### 2.1 Agent Portal（代理商门户）

| 功能 | 说明 | 状态 |
|------|------|------|
| 总览 Dashboard | 显示代理商业务概况 | ✅ 已完成 |
| 我的商户 | 管理旗下所有商户 | ✅ 已完成 |
| 入网申请 | 提交新商户申请 | ✅ 已完成 |
| 佣金业绩 | 查看收入统计 | ✅ 已完成 |
| 资料库 | 下载模板和清单 | ✅ 已完成 |

#### 入网申请表单字段

**基本信息**:
- 商户全称（必填）
- 商户简称
- 商户类型（必填）: 有限公司/无限公司/个体户/合伙企业
- 行业类型（必填）: 餐饮/零售/电商等
- 商业登记证号码（必填）
- 公司注册号码
- 注册地址（必填）
- 经营地址（必填）

**联系人**:
- 法定代表人: 姓名、职位、证件号、电话、邮箱、持股比例
- 日常联系人: 姓名、职位、电话、邮箱

**文件上传**:
- 商业登记证（必填）
- 公司注册证明书
- 公司周年申报表
- 公司章程
- 董事身份证/护照（必填）
- 实益拥有人身份证明
- 银行流水（最近3个月）
- 经营场所照片（必填）

**经营信息**:
- 网站 URL
- 应用程式名称
- 业务模式说明（必填）
- 预计月交易额（必填）
- 平均单笔交易金额（必填）

**结算信息**:
- 结算账户名称（必填）
- 银行名称（必填）
- 银行账号（必填）
- 分行代码
- 银行证明文件

---

### 2.2 Merchant Client（商户客户端）

| 功能 | 说明 | 状态 |
|------|------|------|
| 支付页面 | 客户输入金额并支付 | ✅ 已完成 |
| 管理登录 | 商户管理员登录 | ✅ 已完成 |
| 交易记录 | 查看所有交易明细 | ✅ 已完成 |
| 管理者报告 | WhatsApp 自动报告 | ✅ 已完成 |
| 司机管理 | ⚠️ KC 特有功能 | ✅ 已完成 |

#### 支付页面

**功能**:
- 金额选择（预设金额 + 自定义）
- 支付方式选择（银联/支付宝/微信）
- 司机选择（URL 参数自动选择或手动选择）
- 订单提交

**字段**:
- amount: 金额（数字，必填）
- payType: 支付方式（UP_OP/ALI_H5/WX_H5，必填）
- driverCode: 司机编码（可选，KC 特有）

#### 管理后台 - 交易记录

**功能**:
- 交易列表展示
- 日期范围筛选
- 状态筛选（成功/处理中/失败）
- 支付方式筛选
- 司机筛选（KC 特有）
- 订单号搜索
- 数据导出（CSV）

**显示字段**:
- 订单号
- 支付订单号
- 时间
- 金额
- 支付方式
- 司机信息（KC 特有）
- 状态

#### 管理后台 - 管理者报告

**功能**:
- 今日业务概览卡片
- 自动报告设置（发送时间、内容选项）
- WhatsApp 收件人管理
- 报告预览
- 立即发送
- 测试发送

**报告内容**:
- 交易总额
- 订单总数
- 支付方式分布
- 司机业绩（KC 特有）

#### 管理后台 - 司机管理 ⚠️ KC 特有

**功能**:
- 司机列表
- 今日业绩统计
- 专属支付链接/二维码
- 业绩占比可视化

**司机数据**:
- 司机编码（如 KC001）
- 姓名
- 电话
- 状态（在职/离职）
- 今日订单数
- 今日收款金额

---

### 2.3 Worker API（统一接口层）

| 接口 | 说明 | 状态 |
|------|------|------|
| 创建支付 | 创建支付订单 | ✅ 已完成 |
| 查询交易 | 查询交易记录 | ✅ 已完成 |
| 统计数据 | 获取统计信息 | ✅ 已完成 |
| Webhook | 接收支付回调 | ✅ 已完成 |

#### 创建支付

```
POST /api/v1/{merchantCode}/payment/create
```

**请求参数**:
- amount: number (必填)
- payType: string (必填)
- subject: string (可选)
- description: string (可选)
- driverCode: string (可选，KC 特有)

**响应**:
- orderNo: 订单号
- payUrl: 支付跳转链接
- amount: 金额
- currency: 货币

#### 查询交易

```
GET /api/v1/{merchantCode}/admin/transactions
```

**查询参数**:
- startDate: string (YYYY-MM-DD)
- endDate: string (YYYY-MM-DD)
- status: string (success/pending/failed)
- payType: string (UP_OP/ALI_H5/WX_H5)
- driverCode: string (可选，KC 特有)
- orderNo: string

#### 统计数据

```
GET /api/v1/{merchantCode}/admin/statistics
```

**响应字段**:
- todayRevenue: number
- todayOrders: number
- successRate: number
- avgResponseTime: number
- payTypeStats: array
- driverRevenue: object (KC 特有)

---

## 3. 权限体系

### 3.1 角色定义

| 角色 | 权限范围 | 操作权限 |
|------|----------|----------|
| Super Admin | 全平台 | 所有权限 |
| Agent | 旗下商户 | 查看、提交申请 |
| Merchant Admin | 本商户 | 查看交易、管理配置 |

### 3.2 数据隔离

- 代理商只能看到自己旗下商户的数据
- 商户只能看到自己的交易数据
- 平台管理员可以看到所有数据

---

## 4. KC 特有功能标注 ⚠️

以下功能是 King Chicken 特有的，其他商户需根据业务类型调整：

### 4.1 司机管理（drivers.html）

**KC 场景**: 配送服务，需要追踪哪个司机收款

**其他商户替代方案**:

| 商户类型 | 替代功能 | 说明 |
|----------|----------|------|
| 餐饮（非配送） | 桌台管理 | 按桌台统计业绩 |
| 零售 | 店员管理 | 按店员统计业绩 |
| 电商 | 渠道管理 | 按渠道（网站/App）统计 |
| 其他 | 禁用 | config.js 中设置 features.drivers: false |

### 4.2 driverCode 字段

**数据库**: transactions 表中的 driverCode 字段
**API**: 支持 driverCode 筛选和统计
**前端**: 支付页面和管理后台都支持司机选择

---

## 5. 配置说明

### 5.1 商户模板配置

```javascript
// config.js
const MERCHANT_CONFIG = {
  // 基本信息
  code: 'MERCHANT_CODE',
  name: '商户名称',
  logo: 'logo.png',
  
  // 主题
  theme: {
    primary: '#FF6B00',
    secondary: '#C9A961'
  },
  
  // 功能开关
  features: {
    drivers: false,        // 是否启用司机管理（KC 特有）
    bossReport: true,      // 是否启用管理者报告
    whatsappNotification: true  // 是否启用 WhatsApp 通知
  }
};
```

---

## 6. 技术规格

### 6.1 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端 | HTML/CSS/JS | 纯前端，无框架 |
| 后端 | Cloudflare Worker | Serverless |
| 数据库 | Cloudflare D1 | SQLite |
| 部署 | Cloudflare Pages | 静态托管 |

### 6.2 浏览器支持

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### 6.3 性能指标

| 指标 | 目标 | 当前 |
|------|------|------|
| 页面加载 | < 3s | ✅ |
| API 响应 | < 500ms | ✅ |
| 并发支持 | 1000+ | ✅ |

---

## 7. 更新计划

### 已完成 ✅

- [x] Agent Portal 基础功能
- [x] KC 客户端三 TAB 导航
- [x] 司机管理功能
- [x] WhatsApp 自动报告

### 计划中 📋

- [ ] Agent API 后端实现
- [ ] 商户模板配置化
- [ ] 一键开通脚本
- [ ] 数据报表导出
- [ ] 多语言支持

---

## 8. 附录

### 8.1 术语表

| 术语 | 说明 |
|------|------|
| Agent | 代理商，拓展商户的合作伙伴 |
| Merchant | 商户，使用支付系统的客户 |
| mchNo | 商户号，EasyLink 分配的唯一标识 |
| driverCode | 司机编码，KC 特有 |
| payType | 支付方式 |

### 8.2 文档索引

- [部署记录](DEPLOYMENT_LOG.md)
- [运维手册](OPERATIONS_MANUAL.md)
- [故障排查](TROUBLESHOOTING.md)
- [API 文档](API_REFERENCE.md)
- [Agent 使用指南](AGENT_PORTAL_GUIDE.md)

---

**文档维护**: 系统架构师  
**最后更新**: 2026-03-26
