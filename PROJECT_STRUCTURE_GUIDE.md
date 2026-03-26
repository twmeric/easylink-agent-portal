# EasyLink SaaS 平台 - 文件系統結構指南

## 核心概念

```
┌─────────────────────────────────────────────────────────────────┐
│                     EasyLink SaaS 平台架構                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐   │
│  │   商戶 A      │     │   商戶 B      │     │   商戶 C      │   │
│  │ King-Chicken │     │   餐廳甲      │     │   零售店乙    │   │
│  └──────┬───────┘     └──────┬───────┘     └──────┬───────┘   │
│         │                    │                    │            │
│         └────────────────────┼────────────────────┘            │
│                              ▼                                 │
│         ┌──────────────────────────────────────┐               │
│         │      EasyLink 統一平台 (Worker)       │               │
│         │  - 支付處理                           │               │
│         │  - 數據管理                           │               │
│         │  - Webhook 處理                       │               │
│         └──────────────────────────────────────┘               │
│                              │                                 │
│                              ▼                                 │
│         ┌──────────────────────────────────────┐               │
│         │      Cloudflare D1 數據庫             │               │
│         │  - 商戶數據隔離                       │               │
│         │  - 交易記錄                           │               │
│         └──────────────────────────────────────┘               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 文件夾結構說明

### 1. `C:\Users\Owner\Cloudflare\Easylink` - 平台核心
**用途：** SaaS 平台的中央管理系統

**內容：**
- 超級管理員後台（管理所有商戶）
- 平台級配置文件
- 文檔和架構設計
- 數據庫遷移腳本

**部署後網址：**
- 超級管理台：`https://easylink-admin.pages.dev`

---

### 2. `C:\Users\Owner\Cloudflare\king-chicken-v2` - King Chicken v2 (SaaS版本)
**用途：** King Chicken 在 EasyLink SaaS 平台上的實例

**結構：**
```
king-chicken-v2/
├── apps/
│   └── worker/              # ← 這是共享的 Worker（所有商戶共用）
│       └── src/
│           └── index.js     # 統一處理 KC, 商戶B, 商戶C...
├── clients/
│   └── kingchicken/         # ← KC 專屬客戶端（獨立 Pages 部署）
│       ├── index.html       # 支付頁面
│       ├── login.html       # 管理登入
│       ├── admin.html       # 交易記錄
│       ├── boss-report.html # 老闆報告
│       └── drivers.html     # 司機管理
└── config/
    └── database-migrations/ # 數據庫遷移腳本
```

**部署後網址：**
- 支付頁面：`https://easylink-client-kingchicken.pages.dev`
- 管理後台：`https://easylink-client-kingchicken.pages.dev/login.html`

**關鍵理解：**
- `clients\kingchicken` 不是 "client" 的意思，而是 "merchant client instance"
- 每個商戶都有一個獨立的 `clients\{merchant}` 文件夾
- 這些文件夾獨立部署到 Cloudflare Pages，擁有獨立域名

---

### 3. `C:\Users\Owner\Cloudflare\kingchicken` - 【即將被取代】
**用途：** 舊的單一商戶系統（v1 版本）

**狀態：** ⚠️ 即將棄用

**內容：**
- 原始 King Chicken 系統
- 包含 `UpayClient\_KC` 和 `UpayClient\_dummy`
- 舊的 API Worker

**遷移計劃：**
1. 所有功能遷移到 `king-chicken-v2`
2. 測試完成後刪除

---

### 4. `C:\Users\Owner\Cloudflare\Upay` - 對外品牌系統
**用途：** Upay 是對外的 Trade Name

**作用：**
- 推廣 EasyLink 服務時使用 Upay 品牌
- 對外宣傳、合約、名片等
- 技術底層仍是 EasyLink

---

### 5. `C:\Users\Owner\Cloudflare\UpayClient` - 【已棄用】
**用途：** 早期客戶端模板

**狀態：** ❌ 已棄用，功能合併到 Easylink 平台

---

### 6. `C:\Users\Owner\Cloudflare\upay-client-kc` - 【已棄用】
**用途：** 早期 KC 客戶端

**狀態：** ❌ 已棄用，遷移到 `king-chicken-v2\clients\kingchicken`

---

## SaaS 商戶部署結構

當有 100 個商戶時，文件系統將是：

```
Easylink/                           # 平台核心
├── super-admin/                    # 超級管理員後台
├── docs/                           # 平台文檔
└── config/                         # 平台配置

king-chicken-v2/                    # King Chicken (v2 SaaS版)
├── apps/worker/                    # 【共享】Worker API
├── clients/kingchicken/            # KC 專屬客戶端
└── config/

merchant-restaurant-v2/             # 餐廳甲 (v2 SaaS版)
├── clients/restaurant/             # 餐廳專屬客戶端
└── (共享同一個 worker)

merchant-retail-v2/                 # 零售店乙 (v2 SaaS版)
├── clients/retail/                 # 零售店專屬客戶端
└── (共享同一個 worker)

... 其他 97 個商戶
```

---

## Staging vs Production

### Staging（測試環境）
```
Easylink/
├── staging/                        # 平台級 Staging
│   └── super-admin/                # 測試用超級管理台
│
king-chicken-v2/
├── staging/                        # KC Staging
│   └── client/                     # 測試用客戶端
│
apps/
└── worker-staging/                 # Worker Staging版本
```

### Production（生產環境）
```
king-chicken-v2/
├── clients/kingchicken/            # KC 生產環境客戶端
│   ├── index.html
│   ├── login.html
│   ├── admin.html
│   ├── boss-report.html
│   └── drivers.html
│
apps/
└── worker/                         # Worker 生產版本
```

---

## 部署關係圖

```
                    開發者
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
   [修改代碼]    [修改代碼]    [修改代碼]
        │             │             │
┌───────▼──────┐ ┌───▼────────┐ ┌──▼─────────┐
│ Worker       │ │ KC Client  │ │ Super Admin│
│ (統一平台)    │ │ (獨立部署)  │ │ (平台管理)  │
└───────┬──────┘ └───┬────────┘ └──┬─────────┘
        │             │             │
        ▼             ▼             ▼
   Cloudflare    Cloudflare    Cloudflare
      Workers      Pages          Pages
        │             │             │
        │    easylink-client-       │
        │      kingchicken.         │
        │       pages.dev           │
        │             │             │
        └─────────────┴─────────────┘
                      │
              ┌───────┴───────┐
              ▼               ▼
        [King Chicken]   [其他商戶]
         商戶使用          使用同個
         獨立域名         Worker API
```

---

## 關鍵理解要點

1. **Worker 是共享的**
   - 所有商戶共用同一個 Cloudflare Worker
   - 通過 `merchantCode` 區分不同商戶
   - 數據在數據庫層面隔離

2. **Client 是獨立的**
   - 每個商戶有自己的 Pages 項目
   - 獨立域名、獨立品牌
   - 可自定義樣式和功能

3. **King Chicken 是第一個客戶**
   - 所有新功能先在 KC 上開發測試
   - 成熟後推廣給其他 99 個商戶
   - KC 的 `clients\kingchicken` 是模板

4. **文件路徑的含義**
   ```
   king-chicken-v2\clients\kingchicken\index.html
   │     │              │          └── 支付頁面
   │     │              └──────────── 商戶客戶端實例
   │     └─────────────────────────── 商戶項目
   └───────────────────────────────── v2 SaaS版本
   ```

---

## 下一步行動

1. ✅ 將 KC 功能完善（司機系統、Boss Report）
2. ✅ 部署到 Production
3. 🔄 創建 `_dummy` 商戶作為 Staging 模板
4. 🔄 編寫「新商戶開通指南」
5. 🔄 開發「一鍵開通新商戶」腳本
