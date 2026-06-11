-- Migration برای تبدیل INTEGER به BOOLEAN در جداول custom

-- تبدیل is_active در instaflow_direct_cards
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name='instaflow_direct_cards' AND column_name='is_active' AND data_type='integer') THEN
    ALTER TABLE instaflow_direct_cards 
    ALTER COLUMN is_active TYPE BOOLEAN USING (is_active::integer != 0);
  END IF;
END $$;

-- تبدیل is_active و send_dm در instaflow_comment_rules  
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name='instaflow_comment_rules' AND column_name='is_active' AND data_type='integer') THEN
    ALTER TABLE instaflow_comment_rules 
    ALTER COLUMN is_active TYPE BOOLEAN USING (is_active::integer != 0);
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name='instaflow_comment_rules' AND column_name='send_dm' AND data_type='integer') THEN
    ALTER TABLE instaflow_comment_rules 
    ALTER COLUMN send_dm TYPE BOOLEAN USING (send_dm::integer != 0);
  END IF;
END $$;

-- تبدیل is_active و send_once در instaflow_auto_reply_rules
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name='instaflow_auto_reply_rules' AND column_name='is_active' AND data_type='integer') THEN
    ALTER TABLE instaflow_auto_reply_rules 
    ALTER COLUMN is_active TYPE BOOLEAN USING (is_active::integer != 0);
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name='instaflow_auto_reply_rules' AND column_name='send_once' AND data_type='integer') THEN
    ALTER TABLE instaflow_auto_reply_rules 
    ALTER COLUMN send_once TYPE BOOLEAN USING (send_once::integer != 0);
  END IF;
END $$;

-- تبدیل created_at و updated_at از TEXT به TIMESTAMP
DO $$
BEGIN
  -- instaflow_media_assets
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name='instaflow_media_assets' AND column_name='created_at' AND data_type='text') THEN
    ALTER TABLE instaflow_media_assets
    ALTER COLUMN created_at TYPE TIMESTAMP USING created_at::timestamp,
    ALTER COLUMN updated_at TYPE TIMESTAMP USING updated_at::timestamp;
  END IF;
  
  -- instaflow_direct_cards
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name='instaflow_direct_cards' AND column_name='created_at' AND data_type='text') THEN
    ALTER TABLE instaflow_direct_cards
    ALTER COLUMN created_at TYPE TIMESTAMP USING created_at::timestamp,
    ALTER COLUMN updated_at TYPE TIMESTAMP USING updated_at::timestamp;
  END IF;
  
  -- instaflow_reply_templates
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name='instaflow_reply_templates' AND column_name='created_at' AND data_type='text') THEN
    ALTER TABLE instaflow_reply_templates
    ALTER COLUMN created_at TYPE TIMESTAMP USING created_at::timestamp,
    ALTER COLUMN updated_at TYPE TIMESTAMP USING updated_at::timestamp;
  END IF;
  
  -- instaflow_comment_rules
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name='instaflow_comment_rules' AND column_name='created_at' AND data_type='text') THEN
    ALTER TABLE instaflow_comment_rules
    ALTER COLUMN created_at TYPE TIMESTAMP USING created_at::timestamp,
    ALTER COLUMN updated_at TYPE TIMESTAMP USING updated_at::timestamp;
  END IF;
  
  -- instaflow_auto_reply_rules
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name='instaflow_auto_reply_rules' AND column_name='created_at' AND data_type='text') THEN
    ALTER TABLE instaflow_auto_reply_rules
    ALTER COLUMN created_at TYPE TIMESTAMP USING created_at::timestamp,
    ALTER COLUMN updated_at TYPE TIMESTAMP USING updated_at::timestamp;
  END IF;
END $$;
