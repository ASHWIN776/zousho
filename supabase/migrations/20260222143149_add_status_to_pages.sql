-- Add status column with default 'ready' so existing rows are unaffected
CREATE TYPE page_status AS ENUM ('indexing', 'ready', 'failed');
ALTER TABLE pages ADD COLUMN status page_status NOT NULL DEFAULT 'ready';

-- Enable Realtime on pages table for status change notifications
ALTER PUBLICATION supabase_realtime ADD TABLE pages;
