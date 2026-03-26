# EasyLink API 接口文档

**版本**: v1.0  
**最后更新**: 2026-03-26  
**Base URL**: `https://easylink-api-v2.jimsbond007.workers.dev`

---

## 认证方式

当前使用简单的 merchantCode 参数进行商户识别。

---

## 接口列表

### 1. 支付接口

#### 创建支付订单

```http
POST /api/v1/{merchantCode}/payment/create
```

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| amount | number | 是 | 金额（港币） |
| payType | string | 是 | 支付方式: `UP_OP`, `ALI_H5`, `WX_H5` |
| subject | string | 否 | 订单标题 |
| description | string | 否 | 订单描述 |
| driverCode | string | 否 | 司机编码（KC特有） |
| returnUrl | string | 否 | 支付完成跳转地址 |

**响应示例**:

```json
{
  "success": true,
  "data": {
    "orderNo": "KCORDXXXXXXX",
    "payUrl": "https://pay.example.com/...",
    "amount": 100.00,
    "currency": "HKD"
  }
}
```

---

### 2. 管理接口

#### 查询交易记录

```http
GET /api/v1/{merchantCode}/admin/transactions
```

**查询参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| startDate | string | 开始日期 (YYYY-MM-DD) |
| endDate | string | 结束日期 (YYYY-MM-DD) |
| status | string | 状态: `success`, `pending`, `failed` |
| payType | string | 支付方式: `UP_OP`, `ALI_H5`, `WX_H5` |
| driverCode | string | 司机编码（KC特有） |
| orderNo | string | 订单号搜索 |

**响应示例**:

```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": 1,
        "orderNo": "KCORDXXXXXXX",
        "payOrderId": "PAYXXXXXXXX",
        "amount": 100.00,
        "currency": "HKD",
        "payType": "UP_OP",
        "status": "success",
        "driverCode": "KC001",
        "driverName": "張師傅",
        "createdAt": "2024/03/26 14:30:00"
      }
    ]
  }
}
```

---

#### 获取统计数据

```http
GET /api/v1/{merchantCode}/admin/statistics
```

**响应示例**:

```json
{
  "success": true,
  "data": {
    "todayRevenue": 5000.00,
    "todayOrders": 25,
    "successRate": 98.5,
    "avgResponseTime": 1.2,
    "payTypeStats": [
      {
        "type": "UP_OP",
        "count": 15,
        "total": 3000.00
      }
    ],
    "driverRevenue": {
      "KC001": 2000.00,
      "KC002": 1800.00,
      "KC003": 1200.00
    }
  }
}
```

---

### 3. Webhook 接口

#### EasyLink 支付回调

```http
POST /webhook/easylink
```

**Content-Type**: `application/x-www-form-urlencoded`

**接收参数**:

| 参数 | 说明 |
|------|------|
| mchOrderNo | 商户订单号 |
| payOrderId | 支付订单号 |
| amount | 金额（分） |
| status | 状态: `2`成功, `3`失败 |
| sign | 签名 |

**响应要求**:
- 成功: 返回 HTTP 200
- 失败: 返回非 200，EasyLink 会重试

---

### 4. 商户配置接口

#### 获取商户配置

```http
GET /api/v1/{merchantCode}/config
```

**响应示例**:

```json
{
  "success": true,
  "data": {
    "code": "KC",
    "name": "King Chicken",
    "theme": "orange",
    "currency": "HKD",
    "logo": "🐔"
  }
}
```

---

## 错误码

| 错误码 | 说明 | 处理方式 |
|--------|------|----------|
| 400 | 请求参数错误 | 检查请求参数 |
| 401 | 未授权 | 检查商户代码 |
| 404 | 资源不存在 | 检查 URL 路径 |
| 500 | 服务器内部错误 | 查看 Worker 日志 |

**错误响应格式**:

```json
{
  "success": false,
  "error": "错误信息"
}
```

---

## 状态码说明

### 交易状态

| 代码 | 状态 | 说明 |
|------|------|------|
| 0 | pending | 待支付 |
| 1 | processing | 处理中 |
| 2 | success | 支付成功 |
| 3 | failed | 支付失败 |
| 4 | cancelled | 已取消 |

### 支付方式

| 代码 | 说明 |
|------|------|
| UP_OP | 银联在线支付 |
| ALI_H5 | 支付宝 H5 |
| WX_H5 | 微信支付 H5 |

---

## 测试示例

### 测试创建支付

```bash
curl -X POST https://easylink-api-v2.jimsbond007.workers.dev/api/v1/KC/payment/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "payType": "UP_OP",
    "subject": "Test Payment",
    "driverCode": "KC001"
  }'
```

### 测试查询交易

```bash
curl "https://easylink-api-v2.jimsbond007.workers.dev/api/v1/KC/admin/transactions?startDate=2024-03-01&status=success"
```

---

## 更新日志

| 日期 | 版本 | 更新内容 |
|------|------|----------|
| 2026-03-26 | v1.0 | 初始版本，包含支付、查询、统计接口 |

---

**文档维护**: 系统架构师
