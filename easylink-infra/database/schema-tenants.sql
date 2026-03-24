-- ============================================
-- Easylink Multi-Tenant Database Schema
-- Supports 1000+ clients with sharding
-- ============================================

-- 主库：租户元数据
CREATE TABLE IF NOT EXISTS tenants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_code TEXT UNIQUE NOT NULL,      -- 'KC', 'ABC', etc.
    client_name TEXT NOT NULL,
    domain TEXT UNIQUE,
    shard_id INTEGER DEFAULT 1,            -- 分片ID
    db_schema TEXT,                        -- 专用schema名(如有)
    config_json TEXT,                      -- 客户配置
    api_key TEXT UNIQUE,                   -- API密钥
    is_active INTEGER DEFAULT 1,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- 插入 King-Chicken
INSERT OR IGNORE INTO tenants (client_code, client_name, domain, config_json) 
VALUES (
    'KC', 
    'King-Chicken',
    'king-chicken.jkdcoding.com',
    '{"theme": "orange", "currency": "HKD", "timezone": "Asia/Hong_Kong"}'
);

-- 插入 Dummy 测试场
INSERT OR IGNORE INTO tenants (client_code, client_name, domain, config_json) 
VALUES (
    'DUMMY',
    'Upay Demo',
    'dummy.jkdcoding.com', 
    '{"theme": "blue", "currency": "HKD", "demo": true}'
);

-- 交易表（分片键：tenant_id）
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id INTEGER NOT NULL,
    order_no TEXT NOT NULL,
    mch_order_no TEXT,
    mch_no TEXT NOT NULL,
    amount INTEGER NOT NULL,
    currency TEXT DEFAULT 'HKD',
    pay_type TEXT,                         -- UP_OP, ALI_H5, WX_H5
    subject TEXT,
    status INTEGER DEFAULT 0,              -- 0:生成, 1:支付中, 2:成功
    channel_order_no TEXT,
    raw_response TEXT,
    created_at INTEGER NOT NULL,
    paid_at INTEGER,
    
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- 复合索引优化
CREATE INDEX IF NOT EXISTS idx_txn_tenant_created 
    ON transactions(tenant_id, created_at);
CREATE INDEX IF NOT EXISTS idx_txn_tenant_status 
    ON transactions(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_txn_order_no 
    ON transactions(order_no);

-- Boss日报配置表
CREATE TABLE IF NOT EXISTS boss_configs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id INTEGER NOT NULL UNIQUE,
    enabled INTEGER DEFAULT 0,
    send_time TEXT DEFAULT '22:00',
    recipients_json TEXT,                  -- [{"phone": "...", "name": "..."}]
    include_trend INTEGER DEFAULT 0,
    include_detail INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Easylink Admin 用户表（简单认证）
CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,                -- 明文存储（内部使用）
    name TEXT,
    is_active INTEGER DEFAULT 1,
    last_login INTEGER
);

-- 插入默认管理员
INSERT OR IGNORE INTO admin_users (email, password, name) 
VALUES ('admin@easylink.com', 'easylink123', 'Administrator');

-- 会话表
CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_type TEXT NOT NULL,               -- 'admin' 或 'client'
    user_id INTEGER NOT NULL,
    tenant_id INTEGER,                     -- client登录时填充
    expires_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
