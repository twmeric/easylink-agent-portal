-- ============================================
-- 修復 boss_report_history 表結構
-- 逐個執行，避免重複欄位錯誤
-- ============================================

-- 第 1 步: 添加 report_content 欄位
-- 如果報錯 "duplicate column name" 表示已存在，繼續下一步
ALTER TABLE boss_report_history ADD COLUMN report_content TEXT;

-- 第 2 步: 添加 recipients_count 欄位
ALTER TABLE boss_report_history ADD COLUMN recipients_count INTEGER DEFAULT 1;

-- 第 3 步: 添加 sent_at 欄位
ALTER TABLE boss_report_history ADD COLUMN sent_at INTEGER;

-- ============================================
-- 驗證表結構（執行後查看）
-- ============================================
PRAGMA table_info(boss_report_history);
