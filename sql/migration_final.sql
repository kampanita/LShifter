-- MIGRATION SCRIPT: Simplify to use user_id directly
-- This script is IDEMPOTENT - safe to run multiple times

-- STEP 1: Rename columns from profile_id to user_id
DO $$
BEGIN
    -- shift_types table
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'shift_types' AND column_name = 'profile_id') THEN
        ALTER TABLE shift_types DROP CONSTRAINT IF EXISTS shift_types_profile_id_fkey;
        ALTER TABLE shift_types RENAME COLUMN profile_id TO user_id;
        RAISE NOTICE 'shift_types.profile_id renamed to user_id';
    ELSE
        RAISE NOTICE 'shift_types.user_id already exists';
    END IF;

    -- days_assignments table
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'days_assignments' AND column_name = 'profile_id') THEN
        ALTER TABLE days_assignments DROP CONSTRAINT IF EXISTS days_assignments_profile_id_fkey;
        ALTER TABLE days_assignments DROP CONSTRAINT IF EXISTS days_assignments_profile_id_date_key;
        ALTER TABLE days_assignments RENAME COLUMN profile_id TO user_id;
        RAISE NOTICE 'days_assignments.profile_id renamed to user_id';
    ELSE
        RAISE NOTICE 'days_assignments.user_id already exists';
    END IF;
    
    -- Add unique constraint if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'days_assignments_user_id_date_key') THEN
        ALTER TABLE days_assignments ADD CONSTRAINT days_assignments_user_id_date_key UNIQUE (user_id, date);
        RAISE NOTICE 'Added unique constraint on days_assignments(user_id, date)';
    END IF;

    -- holidays table
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'holidays' AND column_name = 'profile_id') THEN
        ALTER TABLE holidays DROP CONSTRAINT IF EXISTS holidays_profile_id_fkey;
        ALTER TABLE holidays DROP CONSTRAINT IF EXISTS holidays_profile_id_date_key;
        ALTER TABLE holidays RENAME COLUMN profile_id TO user_id;
        RAISE NOTICE 'holidays.profile_id renamed to user_id';
    ELSE
        RAISE NOTICE 'holidays.user_id already exists';
    END IF;
    
    -- Add unique constraint if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'holidays_user_id_date_key') THEN
        ALTER TABLE holidays ADD CONSTRAINT holidays_user_id_date_key UNIQUE (user_id, date);
        RAISE NOTICE 'Added unique constraint on holidays(user_id, date)';
    END IF;
END $$;

-- STEP 2: Update index
DROP INDEX IF EXISTS idx_days_profile_month;
CREATE INDEX IF NOT EXISTS idx_days_user_month ON days_assignments (user_id, date);

-- STEP 3: Drop ALL existing RLS policies on these tables
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname, tablename
        FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename IN ('shift_types', 'days_assignments', 'holidays')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
        RAISE NOTICE 'Dropped policy % on %', pol.policyname, pol.tablename;
    END LOOP;
END $$;

-- STEP 4: Create new RLS policies using user_id
-- shift_types policies
CREATE POLICY "Users can view own shift_types" ON shift_types
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own shift_types" ON shift_types
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shift_types" ON shift_types
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own shift_types" ON shift_types
  FOR DELETE USING (auth.uid() = user_id);

-- days_assignments policies
CREATE POLICY "Users can view own days_assignments" ON days_assignments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own days_assignments" ON days_assignments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own days_assignments" ON days_assignments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own days_assignments" ON days_assignments
  FOR DELETE USING (auth.uid() = user_id);

-- holidays policies
CREATE POLICY "Users can view own holidays" ON holidays
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own holidays" ON holidays
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own holidays" ON holidays
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own holidays" ON holidays
  FOR DELETE USING (auth.uid() = user_id);

-- DONE!
SELECT 'Migration completed successfully!' as status;
