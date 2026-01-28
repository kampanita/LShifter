-- Row Level Security Policies for LShifter

-- Profiles: Users can only see and modify their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Shift Types: Users can see global shift types (profile_id IS NULL) and their own
CREATE POLICY "Users can view shift types"
  ON shift_types FOR SELECT
  USING (profile_id IS NULL OR profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own shift types"
  ON shift_types FOR INSERT
  WITH CHECK (profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update own shift types"
  ON shift_types FOR UPDATE
  USING (profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own shift types"
  ON shift_types FOR DELETE
  USING (profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  ));

-- Days Assignments: Users can only see and modify their own assignments
CREATE POLICY "Users can view own assignments"
  ON days_assignments FOR SELECT
  USING (profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own assignments"
  ON days_assignments FOR INSERT
  WITH CHECK (profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update own assignments"
  ON days_assignments FOR UPDATE
  USING (profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own assignments"
  ON days_assignments FOR DELETE
  USING (profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  ));

-- Holidays: Users can see global holidays (profile_id IS NULL) and their own
CREATE POLICY "Users can view holidays"
  ON holidays FOR SELECT
  USING (profile_id IS NULL OR profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own holidays"
  ON holidays FOR INSERT
  WITH CHECK (profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update own holidays"
  ON holidays FOR UPDATE
  USING (profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own holidays"
  ON holidays FOR DELETE
  USING (profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  ));

-- Notes: Users can only see and modify notes for their own assignments
CREATE POLICY "Users can view own notes"
  ON notes FOR SELECT
  USING (day_id IN (
    SELECT id FROM days_assignments WHERE profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can insert own notes"
  ON notes FOR INSERT
  WITH CHECK (day_id IN (
    SELECT id FROM days_assignments WHERE profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can update own notes"
  ON notes FOR UPDATE
  USING (day_id IN (
    SELECT id FROM days_assignments WHERE profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can delete own notes"
  ON notes FOR DELETE
  USING (day_id IN (
    SELECT id FROM days_assignments WHERE profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  ));
