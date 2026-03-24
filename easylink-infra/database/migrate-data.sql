-- ============================================
-- Data Migration: Old Schema -> Multi-Tenant
-- ============================================

-- Step 1: 确保 KC 租户存在
INSERT OR IGNORE INTO tenants (id, client_code, client_name, domain, config_json) 
VALUES (1, 'KC', 'King-Chicken', 'king-chicken.jkdcoding.com', '{"theme": "orange", "currency": "HKD"}');

-- Step 2: 迁移现有交易数据（假设全部属于 KC）
INSERT INTO transactions (
    tenant_id, order_no, mch_order_no, mch_no, amount, currency,
    pay_type, subject, status, channel_order_no, raw_response,
    created_at, paid_at
)
SELECT 
    1 as tenant_id,  -- 全部归入 KC
    orderNo, mchOrderNo, mchNo, amount, currency,
    payType, subject, status, channelOrderNo, rawResponse,
    createdAt, paidAt
FROM transactions_old  -- 旧表（如果有）
WHERE NOT EXISTS (SELECT 1 FROM transactions);

-- 或者如果直接用现有表，添加 tenant_id 列
-- ALTER TABLE transactions ADD COLUMN tenant_id INTEGER DEFAULT 1;
-- UPDATE transactions SET tenant_id = 1 WHERE tenant_id IS NULL;

-- Step 3: 初始化 Boss Config
INSERT OR IGNORE INTO boss_configs (tenant_id, enabled, send_time, recipients_json)
VALUES (1, 0, '22:00', '[]');

-- Step 4: 验证迁移
SELECT 'Tenants' as table_name, COUNT(*) as count FROM tenants
UNION ALL
SELECT 'Transactions' as table_name, COUNT(*) as count FROM transactions
UNION ALL
SELECT 'BossConfigs' as table_name, COUNT(*) as count FROM boss_configs;
