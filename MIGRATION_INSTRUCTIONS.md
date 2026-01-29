# IMPORTANTE: Migración de Base de Datos Requerida

## ⚠️ ACCIÓN NECESARIA

Antes de usar la nueva versión de la aplicación, **DEBES ejecutar el script SQL de migración** en tu base de datos de Supabase.

### Pasos

1. **Abre Supabase Dashboard**: Ve a <https://supabase.com/dashboard>
2. **Selecciona tu proyecto**: `LShifter`
3. **Ve a SQL Editor**: En el menú lateral, click en "SQL Editor"
4. **Crea una nueva query**: Click en "New query"
5. **Copia y pega** el contenido del archivo `sql/migration_remove_profiles.sql`
6. **Ejecuta el script**: Click en "Run" o presiona `Ctrl+Enter`

### ¿Qué hace esta migración?

Esta migración simplifica la arquitectura de la base de datos:

- **Elimina la dependencia de la tabla `profiles`**
- **Usa directamente `user_id`** (el UUID de Supabase Auth) en todas las tablas
- **Renombra `profile_id` → `user_id`** en:
  - `shift_types`
  - `days_assignments`
  - `holidays`
- **Actualiza las políticas RLS** para usar `auth.uid()` directamente
- **Actualiza índices y constraints**

### ¿Por qué este cambio?

El problema que experimentabas (datos no se guardaban para nuevos usuarios) era causado por la complejidad innecesaria de tener una tabla `profiles` intermedia. Ahora:

✅ **Más simple**: Un solo identificador (`user_id`)
✅ **Más robusto**: No depende de crear un perfil primero
✅ **Más directo**: Usa el UUID de autenticación directamente

### Verificación

Después de ejecutar la migración, verifica que:

```sql
-- Verifica que las columnas se renombraron correctamente
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('shift_types', 'days_assignments', 'holidays')
AND column_name LIKE '%user_id%';
```

Deberías ver `user_id` en lugar de `profile_id`.

### Datos Existentes

⚠️ **IMPORTANTE**: Si ya tienes datos en la base de datos, esta migración los preservará automáticamente. Las columnas se renombran, pero los datos permanecen intactos.

### Problemas?

Si encuentras algún error durante la migración:

1. **Copia el mensaje de error completo**
2. **No ejecutes el script múltiples veces** (tiene protecciones `IF EXISTS` pero mejor prevenir)
3. **Contacta para soporte**

---

**Versión**: 0.0.6
**Fecha**: 2026-01-29
