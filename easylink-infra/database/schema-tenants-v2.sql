-- ============================================
-- Multi-Tenant Schema Migration (Incremental)
-- For existing database with data
-- ============================================

-- 1. 创建租户元数据表（如果不存在）
CREATE TABLE IF NOT EXISTS tenants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_code TEXT UNIQUE NOT NULL,
    client_name TEXT NOT NULL,
    domain TEXT UNIQUE,
    shard_id INTEGER DEFAULT 1,
    db_schema TEXT,
    config_json TEXT,
    api_key TEXT UNIQUE,
    is_active INTEGER DEFAULT 1,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- 2. 插入默认租户（King-Chicken）
INSERT OR IGNORE INTO tenants (id, client_code, client_name, domain, config_json) 
VALUES (1, 'KC', 'King-Chicken', 'king-chicken.jkdcoding.com', '{"theme": "orange", "currency": "HKD"}');

-- 插入 Dummy 租户
INSERT OR IGNORE INTO tenants (id, client_code, client_name, domain, config_json) 
VALUES (2, 'DUMMY', 'Upay Demo', 'dummy.jkdcoding.com', '{"theme": "blue", "currency": "HKD", "demo": true}');

-- 3. 创建 Boss 配置表
CREATE TABLE IF NOT EXISTS boss_configs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id INTEGER NOT NULL UNIQUE,
    enabled INTEGER DEFAULT 0,
    send_time TEXT DEFAULT '22:00',
    recipients_json TEXT,
    include_trend INTEGER DEFAULT 0,
    include_detail INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- 初始化 KC 的 Boss 配置
INSERT OR IGNORE INTO boss_configs (tenant_id, enabled, send_time, recipients_json)
VALUES (1, 0, '22:00', '[]');

-- 4. 创建 Admin 用户表
CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    is_active INTEGER DEFAULT 1,
    last_login INTEGER
);

-- 插入默认管理员
INSERT OR IGNORE INTO admin_users (email, password, name) 
VALUES ('admin@easylink.com', 'easylink123', 'Administrator');

-- 5. 创建会话表
CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_type TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    tenant_id INTEGER,
    expires_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- 6. 检查 transactions 表是否需要添加 tenant_id
-- 注意：如果表已存在且有数据，需要手动迁移
-- ALTER TABLE transactions ADD COLUMN tenant_id INTEGER DEFAULT 1;
-- UPDATE transactions SET tenant_id = 1 WHERE tenant_id IS NULL;

-- 7. 验证结果
SELECT 'Setup complete' as status;
SELECT * FROM tenants;
