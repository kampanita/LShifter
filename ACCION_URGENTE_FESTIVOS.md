# ⚠️ ACCIÓN URGENTE REQUERIDA ⚠️

## Los festivos NO se ven porque FALTAN las políticas RLS en Supabase

### 🚨 DEBES HACER ESTO AHORA

1. **Abre Supabase Dashboard:**
   <https://app.supabase.com>

2. **Ve a SQL Editor** (menú izquierdo)

3. **Copia y pega este SQL:**

```sql
-- POLÍTICA CRÍTICA PARA FESTIVOS
DROP POLICY IF EXISTS "Users can view holidays" ON holidays;

CREATE POLICY "Users can view holidays"
  ON holidays FOR SELECT
  USING (
    profile_id IS NULL OR 
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );
```

1. **Click en RUN** (o Ctrl+Enter)

2. **Refresca la aplicación web** (F5)

---

## ✅ Cambios Ya Aplicados en el Código

- ✅ Scrollbars añadidos a las tablas
- ✅ Scrollbars añadidos a los modales de edición
- ✅ Mejorada normalización de fechas en App.tsx

## ⏳ Pendiente (REQUIERE TU ACCIÓN)

- [ ] **Ejecutar SQL en Supabase** (ver arriba)

---

**NOTA:** El código está correcto. El problema es que Supabase está bloqueando el acceso a los festivos por falta de políticas RLS.

Después de ejecutar el SQL, deberías ver los festivos con el ribbon rojo en el calendario.
