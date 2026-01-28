-- ============================================
-- SCRIPT COMPLETO PARA ARREGLAR FESTIVOS
-- ============================================
-- Este script aplica las políticas RLS necesarias para que los festivos
-- se muestren correctamente en el calendario.
--
-- INSTRUCCIONES:
-- 1. Abre el SQL Editor en Supabase Dashboard
-- 2. Copia y pega este script completo
-- 3. Ejecuta el script
-- 4. Refresca la aplicación web
-- ============================================

-- PASO 1: Eliminar políticas existentes si las hay (para evitar errores)
DROP POLICY IF EXISTS "Users can view holidays" ON holidays;
DROP POLICY IF EXISTS "Users can insert own holidays" ON holidays;
DROP POLICY IF EXISTS "Users can update own holidays" ON holidays;
DROP POLICY IF EXISTS "Users can delete own holidays" ON holidays;

DROP POLICY IF EXISTS "Users can view shift types" ON shift_types;
DROP POLICY IF EXISTS "Users can insert own shift types" ON shift_types;
DROP POLICY IF EXISTS "Users can update own shift types" ON shift_types;
DROP POLICY IF EXISTS "Users can delete own shift types" ON shift_types;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

DROP POLICY IF EXISTS "Users can view own assignments" ON days_assignments;
DROP POLICY IF EXISTS "Users can insert own assignments" ON days_assignments;
DROP POLICY IF EXISTS "Users can update own assignments" ON days_assignments;
DROP POLICY IF EXISTS "Users can delete own assignments" ON days_assignments;

DROP POLICY IF EXISTS "Users can view own notes" ON notes;
DROP POLICY IF EXISTS "Users can insert own notes" ON notes;
DROP POLICY IF EXISTS "Users can update own notes" ON notes;
DROP POLICY IF EXISTS "Users can delete own notes" ON notes;

-- PASO 2: Crear políticas para HOLIDAYS (¡CRÍTICO!)
-- Esta es la política más importante para que los festivos se vean
CREATE POLICY "Users can view holidays"
  ON holidays FOR SELECT
  USING (
    profile_id IS NULL OR 
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

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

-- PASO 3: Crear políticas para PROFILES
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- PASO 4: Crear políticas para SHIFT_TYPES
CREATE POLICY "Users can view shift types"
  ON shift_types FOR SELECT
  USING (
    profile_id IS NULL OR 
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

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

-- PASO 5: Crear políticas para DAYS_ASSIGNMENTS
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

-- PASO 6: Crear políticas para NOTES
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

-- PASO 7: Insertar festivos de ejemplo (OPCIONAL - solo si no tienes festivos)
-- Descomenta las siguientes líneas si necesitas festivos de prueba

/*
INSERT INTO holidays (id, profile_id, country_code, date, name) VALUES
  (gen_random_uuid(), NULL, 'ES', '2026-01-01', 'Año Nuevo'),
  (gen_random_uuid(), NULL, 'ES', '2026-01-06', 'Reyes Magos'),
  (gen_random_uuid(), NULL, 'ES', '2026-04-03', 'Viernes Santo'),
  (gen_random_uuid(), NULL, 'ES', '2026-05-01', 'Día del Trabajo'),
  (gen_random_uuid(), NULL, 'ES', '2026-08-15', 'Asunción'),
  (gen_random_uuid(), NULL, 'ES', '2026-10-12', 'Día de la Hispanidad'),
  (gen_random_uuid(), NULL, 'ES', '2026-11-01', 'Todos los Santos'),
  (gen_random_uuid(), NULL, 'ES', '2026-12-06', 'Día de la Constitución'),
  (gen_random_uuid(), NULL, 'ES', '2026-12-08', 'Inmaculada Concepción'),
  (gen_random_uuid(), NULL, 'ES', '2026-12-25', 'Navidad')
ON CONFLICT (profile_id, date) DO NOTHING;
*/

-- PASO 8: Verificar que todo está correcto
SELECT 
  'Políticas creadas correctamente' as status,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'holidays') as holidays_policies,
  (SELECT COUNT(*) FROM holidays WHERE profile_id IS NULL) as global_holidays;
