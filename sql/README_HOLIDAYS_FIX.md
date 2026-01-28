# Aplicar Políticas RLS y Festivos

## Problema Identificado

Los festivos no se mostraban en el calendario porque:
1. **Faltaban las políticas RLS (Row Level Security)**: La tabla `holidays` tenía RLS habilitado pero sin políticas definidas, bloqueando el acceso a todos los usuarios.
2. **Dependencia innecesaria en useEffect**: El `currentView` estaba en las dependencias del useEffect que carga los festivos, causando recargas innecesarias.

## Solución

### 1. Aplicar Políticas RLS

Ejecuta el siguiente comando en el SQL Editor de Supabase:

```sql
-- Copiar y pegar el contenido de sql/policies.sql
```

O desde la línea de comandos con Supabase CLI:

```bash
supabase db push --file sql/policies.sql
```

### 2. Insertar Festivos de Prueba

Si necesitas insertar festivos de prueba, ejecuta:

```sql
-- Copiar y pegar el contenido de sql/seeds.sql (sección de Holidays)
```

### 3. Verificar en Supabase Dashboard

1. Ve a **Table Editor** → **holidays**
2. Verifica que existan registros con `profile_id = NULL` (festivos globales)
3. Ve a **Authentication** → **Policies** → **holidays**
4. Verifica que exista la política "Users can view holidays"

## Cambios Realizados en el Código

### App.tsx
- ✅ Mejorado el logging de festivos para debugging
- ✅ Removido `currentView` de las dependencias del useEffect
- ✅ Mejorada la normalización de fechas para manejar diferentes formatos

### Calendar.tsx
- ✅ Añadido debugging detallado para verificar la recepción de festivos
- ✅ El ribbon de festivos ya estaba correctamente implementado

### sql/policies.sql (NUEVO)
- ✅ Políticas RLS para todas las tablas
- ✅ Permite acceso a festivos globales (profile_id IS NULL)
- ✅ Permite acceso a festivos propios del usuario

### sql/seeds.sql
- ✅ Actualizado para incluir festivos españoles de 2026
- ✅ Todos los festivos son globales (profile_id = NULL)

## Verificación

Después de aplicar las políticas, verifica en la consola del navegador:

1. Deberías ver: `"Holidays data received: X rows"`
2. Deberías ver: `"Mapping holiday: [nombre] on [fecha]"`
3. En el calendario, los días festivos deberían tener:
   - Fondo rosa claro (`bg-rose-100/50`)
   - Número del día en rojo (`text-rose-600`)
   - Ribbon rojo en la esquina superior derecha con el nombre del festivo

## Próximos Pasos

Si después de aplicar las políticas los festivos aún no se muestran:

1. Verifica los logs de la consola del navegador
2. Verifica que el usuario esté autenticado
3. Verifica que existan festivos en la base de datos con `profile_id = NULL`
4. Verifica que las políticas RLS estén aplicadas correctamente
