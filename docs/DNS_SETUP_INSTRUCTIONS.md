# DNS 配置指南 - 生产环境部署

## 问题说明

Cloudflare Pages 每次部署会生成随机的 Preview URL（如 `https://8629a521...`）。
需要配置自定义域名作为固定的 Production URL。

## 需要配置的 DNS 记录

### 1. King Chicken 商户系统

在 Cloudflare DNS (jkdcoding.com) 添加：

```
类型: CNAME
名称: king-chicken
目标: easylink-client-kingchicken.pages.dev
代理状态: 已代理 (橙色云)
```

然后访问：
- https://king-chicken.jkdcoding.com
- https://king-chicken.jkdcoding.com/admin.html
- https://king-chicken.jkdcoding.com/payment-success.html

### 2. Agent Portal (已配置)

已配置：
- https://upay-saas.jkdcoding.com ✅

### 3. Worker API (无需配置)

使用默认 Workers 域名：
- https://easylink-api-v2.jimsbond007.workers.dev

## 配置步骤

1. 登录 Cloudflare Dashboard
2. 选择域名 jkdcoding.com
3. 点击 DNS → 添加记录
4. 添加以上 CNAME 记录
5. 在 Pages 项目中验证自定义域

## 当前可用的 Production URLs

| 系统 | 当前 URL | 配置后 URL |
|------|---------|-----------|
| KC Client | https://main.easylink-client-kingchicken.pages.dev | https://king-chicken.jkdcoding.com |
| Agent Portal | https://easylink-agent-portal.pages.dev | https://upay-saas.jkdcoding.com ✅ |
| API | https://easylink-api-v2.jimsbond007.workers.dev | (无需配置) |

## 建议

为避免 Preview URL 变化，请：
1. 始终使用自定义域名访问生产环境
2. 在文档中只记录自定义域名
3. Preview URL 仅用于测试
