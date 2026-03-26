# EasyLink SaaS 支付平台

> 已完成并投入生产使用 | v2.0

## 快速访问

| 系统 | 链接 | 说明 |
|------|------|------|
| **代理商门户** | https://upay-saas.jkdcoding.com | Agent Portal (Dark Mode) |
| **King Chicken** | https://easylink-client-kingchicken.pages.dev | 商户支付系统 |
| **API 文档** | https://easylink-api-v2.jimsbond007.workers.dev/health | 健康检查 |

## 项目结构

```
Easylink/
├── agent-portal/          # 代理商门户 (Dark Mode)
│   ├── index.html
│   ├── login.html
│   ├── new-application.html
│   └── platform-overview.html  ← 项目总览文档
│
├── super-admin/           # 平台超管后台
├── templates/             # 商户模板
│   └── merchant-template/
│
├── docs/                  # 项目文档
│   ├── PROJECT_COMPLETION_SUMMARY.md
│   ├── PAYMENT_CALLBACK_STANDARDIZATION.md
│   └── CALLBACK_PAGES_QUICK_START.md
│
└── .archive/              # 归档文件
```

## 核心功能

- ✅ 统一支付网关 (银联/支付宝/微信)
- ✅ 代理商商户入网申请
- ✅ 渠道管理与业绩统计
- ✅ WhatsApp 自动日报
- ✅ EasyLink 订单批量同步
- ✅ Dark Mode 暗色主题 UI

## 新商户部署

详见 `docs/CALLBACK_PAGES_QUICK_START.md`

## 技术栈

- Cloudflare Workers (后端)
- Cloudflare Pages (前端)
- Cloudflare D1 (数据库)
- EasyLink API (支付通道)

---

**状态**: 生产就绪 ✅

**最后更新**: 2026年3月26日
