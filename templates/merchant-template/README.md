# EasyLink 商户模板

## 说明

此模板基于 King Chicken 配置，用于快速创建新商户。

## 使用方法

1. 复制此文件夹并重命名为 `clients\{商户代码}`
2. 修改 `config.js` 中的商户配置
3. 替换 logo 图片
4. 部署到 Cloudflare Pages

## 需要替换的内容

### 1. 商户信息 (config.js)
```javascript
const MERCHANT_CONFIG = {
  code: 'MERCHANT_CODE',      // 商户代码
  name: '商户名称',            // 显示名称
  logo: 'logo.png',           // Logo 文件名
  theme: {
    primary: '#FF6B00',       // 主题色
    secondary: '#C9A961'      // 次要色
  },
  // 注意：drivers 是 KC 特有功能，其他商户可以禁用或改为其他业务逻辑
  features: {
    drivers: false,           // 是否启用司机管理（KC 特有）
    bossReport: true,         // 是否启用管理者报告
    whatsappNotification: true // 是否启用 WhatsApp 通知
  }
};
```

### 2. 业务逻辑定制

#### 对于非配送类商户（如零售、餐厅）：
- **禁用司机功能**：设置 `features.drivers = false`
- **可选替代方案**：
  - 零售：改为「店员管理」
  - 餐厅：改为「桌台管理」或「服务员管理」
  - 电商：改为「渠道管理」（网站、App、小程序等）

#### 对于配送类商户（如外卖、物流）：
- **启用司机功能**：设置 `features.drivers = true`
- 修改 `drivers.html` 中的标题和字段

### 3. 图片替换
- `logo.png` - 商户 Logo（建议尺寸 200x200px）
- `favicon.ico` - 网站图标

### 4. 部署
```bash
cd clients\{商户代码}
wrangler pages deploy . --project-name=easylink-client-{商户代码}
```

## 文件说明

| 文件 | 用途 | 是否需要修改 |
|------|------|-------------|
| index.html | 支付页面 | 是（配置） |
| login.html | 管理登录 | 否 |
| admin.html | 交易记录 | 否 |
| boss-report.html | 管理者报告 | 可选 |
| drivers.html | 司机/员工管理 | 是（业务逻辑） |
| config.js | 配置文件 | 是（必须） |

## 注意事项

1. **KC 特有功能标注**：所有 King Chicken 特有功能都在代码中标注了 `// KC-SPECIFIC`
2. **多语言支持**：如需支持其他语言，修改对应的文本内容
3. **API 端点**：所有 API 调用都指向统一的 Worker，无需修改
