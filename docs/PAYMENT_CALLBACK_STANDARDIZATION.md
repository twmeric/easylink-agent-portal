# 支付回調頁面標準化部署指南

## 概述

本文檔記錄了支付回調頁面的標準化實施方案，供後續新客戶一鍵部署時參考。

## 回調頁面架構

### 三個標準回調頁面

| 頁面 | 文件名 | 用途 | URL 路徑 |
|-----|--------|------|---------|
| 支付成功 | `payment-success.html` | 顯示支付成功信息 | `/payment-success.html` |
| 支付失敗 | `payment-fail.html` | 顯示支付失敗原因 | `/payment-fail.html` |
| 支付處理中 | `payment-pending.html` | 輪詢支付狀態 | `/payment-pending.html` |

## 實施步驟

### 步驟 1: 創建回調頁面

在商戶客戶端目錄（`clients/{merchant}/`）創建以下三個文件：

#### 1.1 payment-success.html
- 大勾勾動畫圖標（綠色）
- 「支付成功」標題
- 訂單信息卡片（訂單號、支付方式、時間、金額）
- 「返回首頁」和「查看訂單」按鈕
- 從 URL 參數讀取：orderNo, amount, wayCode, successTime

#### 1.2 payment-fail.html
- 叉號動畫圖標（紅色）
- 「支付失敗」標題
- 錯誤原因區域（根據 errCode 顯示對應消息）
- 「重新支付」和「返回首頁」按鈕
- 客服聯繫方式

#### 1.3 payment-pending.html
- 加載動畫圖標（橙色）
- 「支付處理中」標題
- 進度條顯示
- 自動查詢支付狀態（每3秒輪詢 API）
- 手動刷新按鈕
- 60秒超時提示

### 步驟 2: Worker 配置更新

在 `apps/worker/src/index.js` 中添加：

```javascript
const CONFIG = {
  // ... 其他配置
  
  // 商戶自定義域名映射
  MERCHANT_DOMAINS: {
    'KC': 'king-chicken.jkdcoding.com',
    '_dummy': 'dummy.jkdcoding.com',
    // 新商戶在此添加
    'NEWCLIENT': 'newclient.jkdcoding.com'
  }
};

// 獲取商戶回調 URL 函數
function getMerchantReturnUrl(merchantCode) {
  const customDomain = CONFIG.MERCHANT_DOMAINS[merchantCode];
  if (customDomain) {
    return `https://${customDomain}/payment-success.html?merchant=${merchantCode}`;
  }
  return `https://easylink-client-${merchantCode.toLowerCase()}.pages.dev/payment-success.html?merchant=${merchantCode}`;
}
```

在創建支付時使用：

```javascript
const params = {
  // ... 其他參數
  returnUrl: returnUrl || getMerchantReturnUrl(merchant.code || 'KC'),
};
```

### 步驟 3: 部署驗證

1. **部署客戶端頁面**
   ```bash
   cd clients/{merchant}
   wrangler pages deploy . --branch=main
   ```

2. **部署 Worker**
   ```bash
   cd apps/worker
   wrangler deploy
   ```

3. **驗證回調頁面**
   - 直接訪問：`https://{custom-domain}/payment-success.html`
   - 檢查頁面樣式和內容是否正確

### 步驟 4: 支付流程測試

| 測試場景 | 預期結果 |
|---------|---------|
| 支付成功 | 跳轉到 payment-success.html，顯示訂單詳情 |
| 支付失敗 | 跳轉到 payment-fail.html，顯示錯誤原因 |
| 支付取消 | 跳轉到 payment-fail.html，顯示「支付已取消」|
| 網絡超時 | 跳轉到 payment-pending.html，自動重試 |

## URL 參數規範

### 成功頁面參數
```
payment-success.html?orderNo=KCORDXXX&amount=1000&wayCode=UP_OP&successTime=1234567890&payOrderId=P2037XXX
```

### 失敗頁面參數
```
payment-fail.html?orderNo=KCORDXXX&amount=1000&errCode=ACQ.INSUFFICIENT_BALANCE&errMsg=餘額不足
```

### 處理中頁面參數
```
payment-pending.html?orderNo=KCORDXXX&amount=1000&wayCode=UP_OP
```

## 常見錯誤碼對照表

| EasyLink 錯誤碼 | 顯示消息 |
|----------------|---------|
| ACQ.PAYMENT_AUTH_CODE_INVALID | 支付授權碼無效，請重新嘗試 |
| ACQ.INSUFFICIENT_BALANCE | 餘額不足，請更換支付方式 |
| ACQ.BANK_CARD_ERROR | 銀行卡異常，請聯繫發卡行 |
| ACQ.USER_PAYMENT_CANCELLED | 支付已取消，請重新發起 |
| ACQ.USER_PAYMENT_TIMEOUT | 支付超時，請重新嘗試 |

## 樣式規範

### 顏色主題
```css
:root {
  --hermes-orange: #FF6B00;
  --hermes-dark: #E55A00;
  --cream: #FAF7F2;
  --beige: #EDE8E0;
  --success: #16a34a;
  --danger: #dc2626;
  --warning: #d97706;
}
```

### 頁面結構
```
├── header（Logo + 圖標 + 標題）
├── content（信息卡片 + 按鈕）
└── footer（版權信息）
```

## 新客戶部署清單

- [ ] 創建 `payment-success.html`
- [ ] 創建 `payment-fail.html`
- [ ] 創建 `payment-pending.html`
- [ ] 在 Worker CONFIG 中添加 MERCHANT_DOMAINS 映射
- [ ] 部署客戶端頁面
- [ ] 部署 Worker
- [ ] 測試支付成功流程
- [ ] 測試支付失敗流程
- [ ] 驗證 Custom Domain 回調正確

## 注意事項

1. **Custom Domain 必須正確配置**，否則回調會跳轉到 Pages 默認域名
2. **三個頁面必須同時部署**，確保所有支付場景都有對應頁面
3. **URL 參數必須統一**，方便後續維護和問題排查
4. **頁面樣式與商戶主題保持一致**，使用相同的 CSS 變量

## 參考資料

- King Chicken 示例：`clients/kingchicken/payment-*.html`
- Worker 配置：`apps/worker/src/index.js`
- Custom Domain 配置：Cloudflare Pages 控制台
