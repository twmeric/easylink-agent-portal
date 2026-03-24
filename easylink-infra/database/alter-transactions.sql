-- 为现有 transactions 表添加 tenant_id 列并设置默认值
-- 注意：SQLite 有限制，可能需要重建表

-- 方法：添加列（SQLite 3.2.0+ 支持）
ALTER TABLE transactions ADD COLUMN tenant_id INTEGER DEFAULT 1;

-- 更新现有数据
UPDATE transactions SET tenant_id = 1 WHERE tenant_id IS NULL;

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_txn_tenant ON transactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_txn_tenant_created ON transactions(tenant_id, createdAt);

-- 验证
SELECT tenant_id, COUNT(*) as count FROM transactions GROUP BY tenant_id;
