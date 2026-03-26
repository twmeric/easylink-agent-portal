# EasyLink 項目清理指南

## 目的
整理分散在多個目錄的資產，建立單一可信來源。

## 目錄結構總覽

```
/Users/Owner/Cloudflare/
├── Easylink/                    ← 中央控制台 (文檔 + 演示)
│   ├── saas-platform-overview.html   ← Stakeholder 演示
│   ├── PROJECT_STRUCTURE.md
│   ├── DATABASE_SCHEMA_GUIDE.md
│   └── CLEANUP_GUIDE.md (本文件)
│
├── king-chicken-v2/            ← 新 SaaS 平台 (唯一開發目標)
│   ├── apps/worker/            ← Worker 後端
│   ├── apps/web/               ← Pages 前端
│   ├── packages/database/      ← Schema + Migrations
│   ├── templates/              ← 商戶模板
│   ├── config/merchants/       ← 商戶配置
│   └── docs/                   ← 文檔
│
├── upay-client-kc/             ← 舊生產系統 (保留歷史)
├── UpayClient/                 ← 舊開發目錄 (保留歷史)
└── Upay/                       ← 舊項目 (保留歷史)
```

## 資產歸屬確認

### ✅ 已整合到 king-chicken-v2

| 來源 | 內容 | 新位置 |
|------|------|--------|
| Easylink/docs/api/PAYMENT_API.md | API 規格 | v2/docs/legacy/ |
| Easylink/docs/TRANSACTION_FLOW.md | 流程文檔 | v2/docs/legacy/ |
| Easylink/DATABASE_SCHEMA_GUIDE.md | Schema 指南 | v2/docs/legacy/ |
| UpayClient/_Template/config.js | 模板配置 | v2/templates/ |
| UpayClient/King-Chicken/config.js | KC 配置 | v2/config/merchants/ |
| upay-client-kc/payment-worker/schema-v2-multi-merchant.sql | 多商戶Schema | 已對齊 |

### 📁 保留但不活躍 (歷史參考)

| 目錄 | 用途 | 建議 |
|------|------|------|
| upay-client-kc/ | 舊生產系統 | 域名切換後可歸檔 |
| UpayClient/ | 早期開發目錄 | 保留參考 |
| Upay/ | 早期嘗試 | 可清理 |

## 後續維護規範

### 唯一開發目標
**只有 `king-chicken-v2/` 目錄是活躍開發目標**

### 禁止操作
❌ 不要在以下目錄進行新開發：
- `/upay-client-kc/`
- `/UpayClient/`
- `/Upay/`
- `/Easylink/easylink-admin/` (除非更新演示)

### 允許操作
✅ 只在以下目錄工作：
- `/king-chicken-v2/` - 核心開發
- `/Easylink/saas-platform-overview.html` - 更新演示

## 部署後清理建議

v2 系統正式運行後，可以考慮：

1. **歸檔舊目錄**
   ```bash
   mv upay-client-kc/ archive/upay-client-kc-2026-03/
   mv UpayClient/ archive/UpayClient-legacy/
   ```

2. **保留的文檔**
   - `saas-platform-overview.html` - 持續更新
   - `PROJECT_STRUCTURE.md` - 更新為 v2 結構

3. **清理臨時檔案**
   - 刪除所有 `.wrangler/` 臨時目錄
   - 刪除 `node_modules/` (可通過 npm install 恢復)
