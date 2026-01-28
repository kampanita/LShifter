-- Seeds for testing
-- Note: In a real scenario, profile creation usually happens via triggers on auth.users

-- Profiles (Mock ID used, replace with actual auth.uid in production)
INSERT INTO profiles (id, user_id, name, color) VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'My Calendar', '#4F46E5');

-- Shift Types
INSERT INTO shift_types (id, company, name, color, default_start, default_end, default_duration) VALUES
  (gen_random_uuid(), 'MyCompany', 'Day Shift', '#10B981', '09:00', '17:00', 480),
  (gen_random_uuid(), 'MyCompany', 'Night Shift', '#8B5CF6', '21:00', '05:00', 480),
  (gen_random_uuid(), 'MyCompany', 'Split Shift', '#F59E0B', '13:00', '21:00', 420);

-- Day Assignments
INSERT INTO days_assignments (id, profile_id, date, shift_type_id, note, is_holiday, start_time, end_time) VALUES
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', '2026-02-01', (SELECT id FROM shift_types WHERE name='Day Shift' LIMIT 1), 'Initial Setup', false, '09:00', '17:00'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', '2026-02-02', (SELECT id FROM shift_types WHERE name='Night Shift' LIMIT 1), 'Test Night', false, '21:00', '05:00');

-- Holidays (Global holidays with profile_id = NULL)
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
  (gen_random_uuid(), NULL, 'ES', '2026-12-25', 'Navidad');

-- Notes
INSERT INTO notes (id, day_id, content, created_at) VALUES
  (gen_random_uuid(), (SELECT id FROM days_assignments LIMIT 1), 'Morning briefing required', now());
