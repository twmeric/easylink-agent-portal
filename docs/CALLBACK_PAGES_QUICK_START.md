# 支付回調頁面快速部署指南

## 🚀 一鍵部署步驟

### 1. 複製模板文件

```bash
# 從 KC 複製到新股戶
cp clients/kingchicken/payment-success.html clients/NEWCLIENT/
cp clients/kingchicken/payment-fail.html clients/NEWCLIENT/
cp clients/kingchicken/payment-pending.html clients/NEWCLIENT/
```

### 2. 修改 Worker 配置

在 `apps/worker/src/index.js` 中添加新客戶域名：

```javascript
MERCHANT_DOMAINS: {
  'KC': 'king-chicken.jkdcoding.com',
  '_dummy': 'dummy.jkdcoding.com',
  'NEWCLIENT': 'newclient.jkdcoding.com'  // ← 添加這行
}
```

### 3. 部署

```bash
# 部署客戶端
cd clients/NEWCLIENT
wrangler pages deploy . --branch=main

# 部署 Worker
cd ../../apps/worker
wrangler deploy
```

### 4. 測試

訪問以下 URL 驗證頁面正常：
- `https://newclient.jkdcoding.com/payment-success.html`
- `https://newclient.jkdcoding.com/payment-fail.html`
- `https://newclient.jkdcoding.com/payment-pending.html`

---

## 📋 功能清單

| 頁面 | 功能 | 自動跳轉 |
|-----|------|---------|
| ✅ 成功頁面 | 顯示訂單詳情、返回按鈕 | 支付成功時自動跳轉 |
| ✅ 失敗頁面 | 顯示錯誤原因、重試按鈕 | 支付失敗時自動跳轉 |
| ✅ 處理中頁面 | 自動查詢狀態、進度條 | 等待支付結果時顯示 |

---

## 🔗 重要鏈接

- 詳細文檔：`docs/PAYMENT_CALLBACK_STANDARDIZATION.md`
- KC 示例：`https://king-chicken.jkdcoding.com/payment-success.html`
- API Worker：`https://easylink-api-v2.jimsbond007.workers.dev`
