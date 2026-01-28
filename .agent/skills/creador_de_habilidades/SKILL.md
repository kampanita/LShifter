---
name: creador_de_habilidades
description: Crea nuevas habilidades (skills) para el asistente, definiendo su nombre, descripción e instrucciones en español.
---

# Creador de Habilidades

Esta habilidad te guía en el proceso de creación de una nueva "skill" (habilidad) para el asistente.

## Pasos

1.  **Solicitar Información Básica**:
    - Pide al usuario el **nombre** de la habilidad. Sugiérele usar `snake_case` (ej. `analisis_de_datos`).
    - Pide una **descripción corta** de lo que hace (para el frontmatter YAML).
    - Pide las **instrucciones detalladas** o el propósito principal de la habilidad.

2.  **Crear Estructura de Directorios**:
    - Genera la ruta absoluta para la nueva habilidad: `.agent/skills/<nombre_elegido>/`.
    - Asegúrate de que el directorio padre `.agent/skills` exista (si no, créalo).

3.  **Generar el Archivo SKILL.md**:
    - Crea el archivo `SKILL.md` dentro del directorio de la nueva habilidad.
    - El contenido debe seguir estrictamente este formato:

    ```markdown
    ---
    name: <nombre_elegido>
    description: <descripción_corta>
    ---
    
    # <Nombre Legible>
    
    <instrucciones_detalladas>
    ```

4.  **Confirmación**:
    - Informa al usuario que la habilidad ha sido creada exitosamente en la ruta correspondiente.
    - Anímale a probarla o añadir scripts adicionales si es necesario (en la carpeta de la habilidad).
