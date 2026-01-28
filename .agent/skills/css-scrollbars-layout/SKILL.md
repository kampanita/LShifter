---
name: CSS Scrollbars & Layout Debugging
description: Expert guidance on implementing visible scrollbars and fixing common CSS flexbox/overflow issues. Use when scrollbars don't appear, content overflows incorrectly, or flex layouts break scrolling.
---

# CSS Scrollbars & Layout Debugging

## Cuándo usar esta skill

- Las barras de scroll no aparecen cuando deberían
- El contenido se desborda sin permitir scroll
- Flexbox impide que aparezcan scrollbars
- Necesitas scrollbars personalizados y visibles
- Problemas de altura en layouts flex con scroll

## 🎯 REGLAS DE ORO PARA SCROLLBARS

### 1. NUNCA uses `flex flex-col` en el contenedor con `overflow-y-auto`

```tsx
// ❌ MAL - flex-col impide que el contenedor reconozca límites
<div className="flex-1 flex flex-col overflow-y-auto">
  <div>Contenido largo...</div>
</div>

// ✅ BIEN - Contenedor simple con overflow, contenido interno
<div className="flex-1 overflow-y-auto">
  <div>Contenido largo...</div>
</div>
```

**RAZÓN**: `flex-col` permite que los hijos crezcan infinitamente en altura, impidiendo que el navegador active el scroll.

### 2. Usa `min-h-0` en contenedores flex que necesitan encogerse

```tsx
// ✅ BIEN - min-h-0 permite que el elemento se encoja
<div className="flex-1 flex flex-col">
  <header className="shrink-0">Header fijo</header>
  <div className="flex-1 overflow-y-auto min-h-0">
    Contenido con scroll
  </div>
</div>
```

**RAZÓN**: Por defecto, los elementos flex tienen `min-height: auto`, lo que impide que se encojan por debajo del tamaño de su contenido.

### 3. Solución nuclear: `absolute inset-0`

Cuando flexbox se complica demasiado, usa posicionamiento absoluto:

```tsx
// ✅ BIEN - Fuerza altura exacta = 100% del padre
<div className="relative flex-1">
  <div className="absolute inset-0 overflow-y-auto">
    <div className="p-4">
      Contenido...
    </div>
  </div>
</div>
```

**CUÁNDO USAR**: Cuando tienes múltiples niveles de flex anidados y el scroll no aparece.

## 📜 Scrollbars personalizados visibles

### Estilo completo para navegadores modernos

```css
/* En index.html o CSS global */
<style>
  /* Firefox */
  * {
    scrollbar-width: thin;
    scrollbar-color: #4f46e5 #e5e7eb;
  }

  /* Webkit (Chrome, Safari, Edge) */
  *::-webkit-scrollbar {
    width: 12px;
    height: 12px;
  }

  *::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 10px;
  }

  *::-webkit-scrollbar-thumb {
    background: #4f46e5;
    border-radius: 10px;
    border: 2px solid #f1f5f9;
  }

  *::-webkit-scrollbar-thumb:hover {
    background: #4338ca;
  }

  /* Dark mode */
  [data-theme="dark"] *::-webkit-scrollbar-track {
    background: #1e293b;
  }

  [data-theme="dark"] *::-webkit-scrollbar-thumb {
    background: #6366f1;
    border-color: #1e293b;
  }
</style>
```

**CARACTERÍSTICAS CLAVE**:

- **12px de ancho** - visible pero no invasivo
- **Color distintivo** (índigo/púrpura) - fácil de ver
- **Borde en el thumb** - mejor contraste
- **Soporte dark mode**
- **Funciona en todos los navegadores modernos**

## 🏗️ Patrones de estructura recomendados

### Patrón 1: Vista completa con header y scroll

```tsx
function View() {
  return (
    <div className="absolute inset-0 flex flex-col">
      {/* Header fijo */}
      <header className="shrink-0">Header</header>
      
      {/* Contenido con scroll */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          Contenido muy largo...
        </div>
      </div>
    </div>
  );
}
```

### Patrón 2: Múltiples secciones con scroll compartido

```tsx
function ComplexView() {
  return (
    <div className="absolute inset-0 flex flex-col">
      <header className="shrink-0">Header</header>
      
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col">
          <section className="flex-1">Contenido 1</section>
          <section className="flex-1">Contenido 2</section>
          <footer className="shrink-0">Botones fijos abajo</footer>
        </div>
      </div>
    </div>
  );
}
```

### Patrón 3: Grid con scroll (calendarios, tablas)

```tsx
function CalendarView() {
  return (
    <div className="absolute inset-0 overflow-y-auto bg-gray-100">
      <div className="p-8 min-h-full flex flex-col">
        <div className="flex-1 bg-dark rounded-xl overflow-hidden">
          {/* Grid que puede crecer */}
          <div className="grid grid-cols-7 gap-2 p-4">
            {/* Items... */}
          </div>
        </div>
      </div>
    </div>
  );
}
```

## 🐛 Debugging checklist

Cuando las scrollbars no aparecen, verifica EN ORDEN:

1. **¿El contenedor padre tiene altura definida?**
   - Usar `h-screen`, `h-full`, `flex-1`, o `absolute inset-0`
   - SIN altura definida = SIN scroll

2. **¿Hay `overflow-hidden` en algún padre?**
   - Buscar en TODA la cadena de padres
   - `overflow-hidden` corta el scroll incluso si el hijo lo define

3. **¿El contenedor con scroll tiene `flex-col`?**
   - Si es así, QUÍTALO
   - Mueve el contenido a un hijo interno

4. **¿Falta `min-h-0` en contenedores flex?**
   - Añadir `min-h-0` a elementos flex que deben scrollear

5. **¿Usas alturas dinámicas como `h-[calc(...)]`?**
   - Evítalas, usa flexbox o absolute inset-0

6. **¿Los scrollbars están ocultos por CSS?**
   - Verificar que no haya `scrollbar-width: none` o `.hide-scrollbar`

## 🎨 Utilities útiles para scroll

```css
/* Suavizar scroll en móvil */
.smooth-scroll {
  -webkit-overflow-scrolling: touch;
}

/* Solo para táctil */
.touch-pan-y {
  touch-action: pan-y;
}

/* Evitar scroll en direcciones no deseadas */
.overscroll-contain {
  overscroll-behavior: contain;
}

/* Mantener espacio para scrollbar (evita saltos de layout) */
.scrollbar-gutter-stable {
  scrollbar-gutter: stable;
}
```

## ⚠️ ERRORES COMUNES Y SOLUCIONES

### Error 1: "El contenido se corta pero no hay scroll"

**Causa**: Padre con `overflow-hidden`  
**Solución**: Buscar y quitar `overflow-hidden` en la cadena de padres

### Error 2: "Scroll funciona en desktop pero no en móvil"

**Causa**: Falta optimización táctil  
**Solución**: Añadir `touch-action: pan-y` y `-webkit-overflow-scrolling: touch`

### Error 3: "La scrollbar no se ve"

**Causa**: Color muy similar al fondo  
**Solución**: Usar colores contrastantes (ej: índigo sobre gris claro)

### Error 4: "El contenido crece infinitamente"

**Causa**: `flex-col` en contenedor con scroll  
**Solución**: Quitar `flex-col`, usar contenedor simple

### Error 5: "Todo funciona menos en una vista específica"

**Causa**: Estructura de padres diferente  
**Solución**: Aplicar `absolute inset-0` en esa vista específica para uniformizar

## 📱 Consideraciones móviles

1. **Scrollbars en móvil son más delgadas** - diseña para que sean visibles
2. **Usa `touch-action`** para optimizar gestos
3. **Evita `position: fixed`** dentro de contenedores con scroll
4. **Prueba en viewport pequeño** - reduce el navegador a 375px de ancho

## 🚀 TL;DR - Solución rápida

```tsx
// Wrapper de vista
<div className="absolute inset-0 flex flex-col">
  {/* Header fijo sin scroll */}
  <header className="shrink-0">...</header>
  
  {/* Contenedor de scroll - SIN flex-col */}
  <div className="flex-1 overflow-y-auto">
    {/* Contenido interno - AQUÍ sí puedes usar flex-col */}
    <div className="p-4 space-y-4">
      <section>...</section>
      <section>...</section>
    </div>
  </div>
  
  {/* Footer fijo sin scroll */}
  <footer className="shrink-0">...</footer>
</div>
```

## 📚 Recursos

- [MDN: CSS Overflow](https://developer.mozilla.org/en-US/docs/Web/CSS/overflow)
- [MDN: Scrollbar styling](https://developer.mozilla.org/en-US/docs/Web/CSS/::-webkit-scrollbar)
- [CSS Tricks: Flexbox](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)

---

**Última actualización**: 2026-01-28  
**Basado en**: Debugging intensivo de scrollbars en ShiftPlanner app
