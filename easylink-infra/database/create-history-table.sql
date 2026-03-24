-- Create boss report history table
CREATE TABLE IF NOT EXISTS boss_report_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id INTEGER NOT NULL,
    report_date TEXT NOT NULL,
    total_amount INTEGER DEFAULT 0,
    order_count INTEGER DEFAULT 0,
    success_rate REAL DEFAULT 0,
    sent_to TEXT,
    sent_at INTEGER,
    status TEXT DEFAULT 'sent',
    error_message TEXT,
    created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
);

CREATE INDEX IF NOT EXISTS idx_boss_report_history_tenant ON boss_report_history(tenant_id);
CREATE INDEX IF NOT EXISTS idx_boss_report_history_date ON boss_report_history(report_date);
