-- MIGRATION: Remove profiles table dependency
-- Use auth.users(id) directly as user_id in all tables
-- NOTE: We cannot create FK constraints to auth.users, so we just rename columns

-- 1. Rename profile_id to user_id in all tables
ALTER TABLE shift_types DROP CONSTRAINT IF EXISTS shift_types_profile_id_fkey;
ALTER TABLE shift_types RENAME COLUMN profile_id TO user_id;
-- No FK constraint to auth.users - Supabase doesn't allow it

ALTER TABLE days_assignments DROP CONSTRAINT IF EXISTS days_assignments_profile_id_fkey;
ALTER TABLE days_assignments RENAME COLUMN profile_id TO user_id;
ALTER TABLE days_assignments DROP CONSTRAINT IF EXISTS days_assignments_profile_id_date_key;
ALTER TABLE days_assignments ADD CONSTRAINT days_assignments_user_id_date_key UNIQUE (user_id, date);

ALTER TABLE holidays DROP CONSTRAINT IF EXISTS holidays_profile_id_fkey;
ALTER TABLE holidays RENAME COLUMN profile_id TO user_id;
ALTER TABLE holidays DROP CONSTRAINT IF EXISTS holidays_profile_id_date_key;
ALTER TABLE holidays ADD CONSTRAINT holidays_user_id_date_key UNIQUE (user_id, date);

-- 2. Update index
DROP INDEX IF EXISTS idx_days_profile_month;
CREATE INDEX idx_days_user_month ON days_assignments (user_id, date);

-- 3. Update RLS policies (example - adjust based on your actual policies)
-- Drop old policies if they exist
DROP POLICY IF EXISTS "Users can view own data" ON shift_types;
DROP POLICY IF EXISTS "Users can insert own data" ON shift_types;
DROP POLICY IF EXISTS "Users can update own data" ON shift_types;
DROP POLICY IF EXISTS "Users can delete own data" ON shift_types;

DROP POLICY IF EXISTS "Users can view own data" ON days_assignments;
DROP POLICY IF EXISTS "Users can insert own data" ON days_assignments;
DROP POLICY IF EXISTS "Users can update own data" ON days_assignments;
DROP POLICY IF EXISTS "Users can delete own data" ON days_assignments;

DROP POLICY IF EXISTS "Users can view own data" ON holidays;
DROP POLICY IF EXISTS "Users can insert own data" ON holidays;
DROP POLICY IF EXISTS "Users can update own data" ON holidays;
DROP POLICY IF EXISTS "Users can delete own data" ON holidays;

-- Create new policies using user_id
CREATE POLICY "Users can view own shift_types" ON shift_types
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own shift_types" ON shift_types
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shift_types" ON shift_types
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own shift_types" ON shift_types
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own days_assignments" ON days_assignments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own days_assignments" ON days_assignments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own days_assignments" ON days_assignments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own days_assignments" ON days_assignments
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own holidays" ON holidays
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own holidays" ON holidays
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own holidays" ON holidays
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own holidays" ON holidays
  FOR DELETE USING (auth.uid() = user_id);

-- 4. profiles table can be kept for future use (name, preferences) but is no longer required
-- If you want to drop it completely:
-- DROP TABLE IF EXISTS profiles CASCADE;
