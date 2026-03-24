# EasyLink Payment System - Project Structure

## 中央控制台位置
`C:\Users\Owner\Cloudflare\Easylink`

## Folder 結構說明

### 1. 生產環境 (Production)
**Location:** `C:\Users\Owner\Cloudflare\upay-client-kc`
- **用途:** 生產環境部署
- **內容:**
  - `index.html` - 支付頁面
  - `admin.html` - 管理後台
  - `login.html` - 登入頁面
  - `boss-report.html` - 管理層報告
  - `.github/workflows/` - CI/CD 配置
- **GitHub Repo:** `twmeric/upay-client-kc`
- **部署URL:** https://upay-client-kc.pages.dev

### 2. Worker 後端
**Location:** `C:\Users\Owner\Cloudflare\kingchicken\payment-worker`
- **用途:** Cloudflare Worker 生產代碼
- **GitHub Repo:** `twmeric/upay-client-kc` (同前端)
- **部署URL:** https://payment-api.jimsbond007.workers.dev

### 3. Staging 環境 (Dummy)
**Location:** `C:\Users\Owner\Cloudflare\Easylink\staging`
- **用途:** 測試和調試環境
- **計劃:** 複製 king-chicken 方案作為調試基地

### 4. 現有系統 (UpayClient)
**Location:** `C:\Users\Owner\Cloudflare\UpayClient`
- **用途:** 原有 UpayClient 系統

### 5. AI Architect 控制台
**Location:** `C:\Users\Owner\Cloudflare\Easylink\easylink-admin`
- **用途:** AI 架構師控制台

### 6. 基礎設施
**Location:** `C:\Users\Owner\Cloudflare\Easylink\easylink-infra`
- **用途:** 基礎設施配置

## API 文檔位置

### API 規格文檔
`C:\Users\Owner\Cloudflare\Easylink\docs\api\`

需要創建的文檔：
1. `PAYMENT_API.md` - 支付 API 規格
2. `ADMIN_API.md` - 管理後台 API 規格
3. `BOSS_REPORT_API.md` - 報告 API 規格

## 部署腳本
`C:\Users\Owner\Cloudflare\Easylink\scripts\deploy\`

## 配置檔案
`C:\Users\Owner\Cloudflare\Easylink\config\`

## 當前狀態

### 已完成 ✅
1. Worker 後端部署 (payment-api.jimsbond007.workers.dev)
2. 前端頁面部署 (upay-client-kc.pages.dev)
3. 支付功能正常運作
4. 管理後台基礎功能完成

### 進行中 🔄
1. Staging 環境設置
2. API 文檔編寫
3. 備註功能優化

### 待完成 📋
1. Dummy 環境完整複製
2. 自動化部署腳本
3. 完整 API 文檔
4. 單元測試

## 重要 URL

| 環境 | URL |
|------|-----|
| 生產前端 | https://upay-client-kc.pages.dev |
| 生產 API | https://payment-api.jimsbond007.workers.dev |
| Staging | (待設置) |

## 數據庫結構

### transactions 表
```sql
- id: INTEGER PRIMARY KEY
- order_no: TEXT (商家訂單號)
- merchant_id: TEXT
- amount: INTEGER (分為單位)
- currency: TEXT
- pay_type: TEXT (UP_OP/ALI_H5/WX_H5)
- status: TEXT (pending/success/failed/paid)
- pay_order_id: TEXT (EasyLink P開頭訂單號)
- raw_response: TEXT
- remark: TEXT (備註)
- created_at: INTEGER (timestamp)
- updated_at: INTEGER (timestamp)
```
