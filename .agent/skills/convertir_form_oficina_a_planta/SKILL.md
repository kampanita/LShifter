---
name: convertir_form_oficina_a_planta
description: Conversión del formulario de oficina `frmPines` a su versión de planta `frmPinesPlanta`, siguiendo el patrón de separación de lógica de negocio y UI adaptada para entornos de producción. Se prioriza la **preservación total de funcionalidades** y la **similitud visual** con la versión de oficina, mejorando únicamente la estética (diseño profesional) sin alterar el flujo de trabajo.
---

# Convertir Form de Oficina a Planta

Esta habilidad te guía en el proceso de conversión de un formulario de oficina (basado en componentes IDS estándar) a un formulario de planta (basado en componentes Enntte y DevExpress).

## Análisis Previo

Antes de comenzar la conversión, analiza el formulario de oficina para identificar:

1. **Componentes UI utilizados**: Grids, botones, filtros, paneles, etc.
2. **Lógica de acceso a datos**: Consultas a base de datos, operaciones CRUD
3. **Lógica de negocio**: Validaciones, cálculos, transformaciones
4. **Eventos y handlers**: Click, Load, AfterRowActivate, etc.
5. **Dependencias externas**: Servicios, boletines, recursos

**CRÍTICO**: Crea una tabla de mapeo (mental o escrita) de **Funcionalidad Oficina -> Funcionalidad Planta**.

- Asegúrate de que **TODAS** las funcionalidades operativas (movimientos, cálculos, procesos) se mantengan.
- Solo elimina elementos puramente visuales obsoletos o menús que no apliquen a planta.
- Si dudas si una función es necesaria, **CONSÉRVALA**.

## Pasos de Conversión

### 1. Crear Estructura del Proyecto de Planta

**IMPORTANTE**: Debes crear TODOS los archivos necesarios para que el proyecto compile correctamente en Visual Studio.

- Crea una nueva carpeta para el form de planta siguiendo la convención: `Fagor.frm[Nombre]Planta`
- Dentro, crea la estructura COMPLETA:

  ```
  Fagor.frm[Nombre]Planta/
  ├── Fagor.frm[Nombre]Planta.sln              ← Archivo de solución (OBLIGATORIO)
  ├── README.md                                 ← Documentación del proyecto
  └── Fagor.frm[Nombre]Planta/
      ├── Fagor.frm[Nombre]Planta.vbproj       ← Archivo de proyecto (OBLIGATORIO)
      ├── Src/
      │   ├── frm[Nombre]Planta.vb             ← Código del formulario
      │   ├── frm[Nombre]Planta.designer.vb    ← Designer con DevExpress
      │   ├── frm[Nombre]Planta.resx           ← Recursos del formulario
      │   └── DynamicUI.vb (opcional)          ← Solo si hay UI dinámica
      ├── BS/
      │   └── clsFrm[Nombre]PlantaBS.vb        ← Business Service
      ├── My Project/                           ← Carpeta de proyecto (OBLIGATORIO)
      │   ├── AssemblyInfo.vb                  ← Info del ensamblado
      │   ├── Application.Designer.vb
      │   ├── Application.myapp
      │   ├── Resources.Designer.vb
      │   ├── Resources.resx
      │   ├── Settings.Designer.vb
      │   ├── Settings.settings
      │   └── licenses.licx
      └── Resources/                            ← Carpeta de recursos (IMPORTANTE)
          └── (iconos, imágenes, etc.)
  ```

**Pasos para crear la estructura:**

1. **Crear directorios**:

   ```powershell
   mkdir "Fagor.frm[Nombre]Planta\Fagor.frm[Nombre]Planta\Src"
   mkdir "Fagor.frm[Nombre]Planta\Fagor.frm[Nombre]Planta\BS"
   mkdir "Fagor.frm[Nombre]Planta\Fagor.frm[Nombre]Planta\My Project"
   mkdir "Fagor.frm[Nombre]Planta\Fagor.frm[Nombre]Planta\Resources"
   ```

2. **Copiar archivos base de configuración**:

   ```powershell
   # Copiar solo archivos de configuración genéricos (NO Settings ni Resources)
   Copy-Item "Fagor.frmLoadPlanta\Fagor.frmLoadPlanta\My Project\Application.*" `
             "Fagor.frm[Nombre]Planta\Fagor.frm[Nombre]Planta\My Project\" -Force
   Copy-Item "Fagor.frmLoadPlanta\Fagor.frmLoadPlanta\My Project\licenses.licx" `
             "Fagor.frm[Nombre]Planta\Fagor.frm[Nombre]Planta\My Project\" -Force
   ```

3. **⚠️ CRÍTICO: Copiar Settings desde el formulario ORIGINAL de oficina**:

   ```powershell
   # Copiar Settings.settings y Settings.Designer.vb del form ORIGINAL
   Copy-Item "Fagor.frm[Nombre]\Fagor.frm[Nombre]\My Project\Settings.settings" `
             "Fagor.frm[Nombre]Planta\Fagor.frm[Nombre]Planta\My Project\" -Force
   Copy-Item "Fagor.frm[Nombre]\Fagor.frm[Nombre]\My Project\Settings.Designer.vb" `
             "Fagor.frm[Nombre]Planta\Fagor.frm[Nombre]Planta\My Project\" -Force
   ```

   **LUEGO, modificar `Settings.Designer.vb`** para actualizar el namespace:
   - Buscar todas las referencias a `Global.Fagor.frm[Nombre].My.MySettings`
   - Reemplazar por `Global.Fagor.frm[Nombre]Planta.My.MySettings`

4. **⚠️ CRÍTICO: Copiar Resources desde el formulario ORIGINAL**:

   ```powershell
   # Copiar Resources.resx y Resources.Designer.vb del form ORIGINAL
   Copy-Item "Fagor.frm[Nombre]\Fagor.frm[Nombre]\My Project\Resources.resx" `
             "Fagor.frm[Nombre]Planta\Fagor.frm[Nombre]Planta\My Project\" -Force
   Copy-Item "Fagor.frm[Nombre]\Fagor.frm[Nombre]\My Project\Resources.Designer.vb" `
             "Fagor.frm[Nombre]Planta\Fagor.frm[Nombre]Planta\My Project\" -Force
   ```

5. **⚠️ CRÍTICO: Copiar .resx del formulario ORIGINAL**:

   ```powershell
   # Copiar el .resx del formulario ORIGINAL de oficina
   Copy-Item "Fagor.frm[Nombre]\Fagor.frm[Nombre]\Src\frm[Nombre].resx" `
             "Fagor.frm[Nombre]Planta\Fagor.frm[Nombre]Planta\Src\frm[Nombre]Planta.resx" -Force
   ```

6. **⚠️ CRÍTICO: Copiar carpeta Resources con iconos**:

   ```powershell
   # Si el form ORIGINAL tiene carpeta Resources, copiarla
   if (Test-Path "Fagor.frm[Nombre]\Fagor.frm[Nombre]\Resources") {
       Copy-Item "Fagor.frm[Nombre]\Fagor.frm[Nombre]\Resources\*" `
                 "Fagor.frm[Nombre]Planta\Fagor.frm[Nombre]Planta\Resources\" -Recurse -Force
   } else {
       # Si no tiene, copiar desde proyecto similar
       Copy-Item "Fagor.frmLoadPlanta\Fagor.frmLoadPlanta\Resources\*" `
                 "Fagor.frm[Nombre]Planta\Fagor.frm[Nombre]Planta\Resources\" -Recurse -Force
   }
   ```

**📋 CHECKLIST DE ARCHIVOS CRÍTICOS:**

- [ ] `Settings.Designer.vb` copiado del original Y namespace actualizado
- [ ] `Settings.settings` copiado del original
- [ ] `Resources.resx` copiado del original
- [ ] `Resources.Designer.vb` copiado del original
- [ ] `frm[Nombre]Planta.resx` copiado del `frm[Nombre].resx` original
- [ ] Carpeta `Resources/` con todos los iconos/imágenes

**⚠️ ERRORES COMUNES A EVITAR:**

```
error MSB3103: Archivo Resx no válido. No se puede encontrar 'Resources\gear_stop.png'
→ Solución: Copiar carpeta Resources/ del form original

error BC30002: No está definido el tipo 'Global.Fagor.frmLoadPlanta.My.MySettings'
→ Solución: Actualizar namespace en Settings.Designer.vb
```

### 2. Modificar el Designer (.designer.vb)

#### 2.1. Cambiar Imports

```vb
' OFICINA:
Imports IDS.ModEstandar.Componentes

' PLANTA:
Imports IDS.ModEstandar.Componentes_Enntte
```

#### 2.2. Cambiar Clase Base

```vb
' OFICINA:
Inherits clsVentanaBase

' PLANTA:
Inherits IDS.UI.VentanaBasePlantav2_0.clsVentanaBasePlanta
```

#### 2.3. Reemplazar Componentes UI

**Grids:**

```vb
' OFICINA:
Friend WithEvents idsGrd As IDS.ModEstandar.Componentes.clscmpGrid

' PLANTA:
Friend WithEvents idsGrd As IDS.ModEstandar.Componentes_Enntte.clscmpGrid_enntte
```

**Botones:**

```vb
' OFICINA:
Friend WithEvents btnAccion As System.Windows.Forms.Button

' PLANTA:
Friend WithEvents btnAccion As IDS.ModEstandar.Componentes_Enntte.cButton
```

**Filtros:**
Los filtros generalmente se eliminan en planta, ya que la versión de planta suele ser más simplificada.

#### 2.4. Implementar Layout con DevExpress

Reemplaza los Panels y controles directos por un `LayoutControl`:

```vb
' Declarar LayoutControl y sus items
Friend WithEvents LayoutControl1 As DevExpress.XtraLayout.LayoutControl
Friend WithEvents Root As DevExpress.XtraLayout.LayoutControlGroup
Friend WithEvents lciGrid As DevExpress.XtraLayout.LayoutControlItem
Friend WithEvents lciBtnAccion As DevExpress.XtraLayout.LayoutControlItem
```

En `InitializeComponent()`:

```vb
' Configurar LayoutControl
Me.LayoutControl1.Dock = System.Windows.Forms.DockStyle.Fill
Me.LayoutControl1.Root = Me.Root

' Añadir controles al LayoutControl
Me.LayoutControl1.Controls.Add(Me.idsGrd)
Me.LayoutControl1.Controls.Add(Me.btnAccion)

' Configurar Root con tabla de layout
Me.Root.LayoutMode = DevExpress.XtraLayout.Utils.LayoutMode.Table
' Definir columnas y filas según necesidad

**Regla de Diseño**:
- Mantén la **distribución visual** lo más parecida posible al form original para que el usuario se sienta familiarizado.
- Usa `LayoutControl` para dar un aspecto **profesional y responsivo** (espaciados uniformes, alineación perfecta).
- No cambies drásticamente la ubicación de los controles importantes. Mejorar la estética SI, cambiar el flujo NO.
```

#### 2.5. Configurar Propiedades de Botones Enntte

```vb
' Ejemplo de configuración de cButton
Me.btnAccion.IDS_TEXT = "Texto del Botón"
Me.btnAccion.IDS_IMAGE = Global.[Namespace].My.Resources.Resources.icono
Me.btnAccion.IDS_IMAGE_ALIGNMENT = DevExpress.XtraEditors.ImageAlignToText.RightCenter
Me.btnAccion.Appearance.BackColor = System.Drawing.Color.PaleGreen
Me.btnAccion.Appearance.Options.UseBackColor = True
Me.btnAccion.Dock = System.Windows.Forms.DockStyle.Fill
```

#### 2.6. ⚠️ IMPORTANTE: Asegurar inicialización completa de LayoutControlItems

Cada `LayoutControlItem` debe tener:

```vb
' 1. Declaración al inicio
Me.lciNombreControl = New DevExpress.XtraLayout.LayoutControlItem()

' 2. BeginInit() en la sección de inicialización
CType(Me.lciNombreControl, System.ComponentModel.ISupportInitialize).BeginInit()

' 3. Incluido en Root.Items.AddRange()
Me.Root.Items.AddRange(New DevExpress.XtraLayout.BaseLayoutItem() {..., Me.lciNombreControl, ...})

' 4. EndInit() al final
CType(Me.lciNombreControl, System.ComponentModel.ISupportInitialize).EndInit()
```

**Error común del diseñador**: Si falta alguno de estos pasos, el diseñador de Visual Studio no abrirá.

### 3. Modificar el Código del Form (.vb)

#### 3.1. Actualizar Imports

```vb
' Añadir:
Imports IDS.ModEstandar.Componentes_Enntte
```

#### 3.2. Declarar Instancia de BS

```vb
Public Class frm[Nombre]Planta
    Private BS As clsFrm[Nombre]PlantaBS
    
    Public Sub New()
        InitializeComponent()
        BS = New clsFrm[Nombre]PlantaBS()
    End Sub
End Class
```

#### 3.3. Extraer Lógica de Acceso a Datos

Identifica todas las operaciones de base de datos y muévelas a la clase BS:

**ANTES(en el form):**

```vb
Private Sub CargarDatos()
    Dim mt As IMetaclase = BaseIds.BaseBS.CargarMetaClase("TABLA")
    Dim dt As DataTable = mt.BuscarPorWhere("condicion")
    idsGrd.DataSource = dt
End Sub
```

**DESPUÉS:**

- **En el form:**

```vb
Private Sub CargarDatos()
    Dim dt As DataTable = BS.ObtenerDatos()
    idsGrd.DataSource = dt
End Sub
```

- **En la clase BS:**

```vb
Public Function ObtenerDatos() As DataTable
    Dim mt As IMetaclase = BaseIds.BaseBS.CargarMetaClase("TABLA")
    Return mt.BuscarPorWhere("condicion")
End Function
```

#### 3.4. ⚠️ CRÍTICO: Convertir MessageBox.Show a EnvioMensajePantalla

En los formularios de planta, **TODOS** los `MessageBox.Show` deben convertirse a `Me.EnvioMensajePantalla`.

**IMPORTANTE**: El orden de los parámetros cambia:

- `MessageBox.Show(mensaje, título, botones, icono)`
- `Me.EnvioMensajePantalla(título, mensaje, botones, icono)`

**Ejemplos de conversión:**

```vb
' OFICINA (ANTES):
MessageBox.Show("Please select a destination pin", "Error", MessageBoxButtons.OK, MessageBoxIcon.Warning)

' PLANTA (DESPUÉS):
Me.EnvioMensajePantalla("Error", "Please select a destination pin", MessageBoxButtons.OK, MessageBoxIcon.Warning)
```

```vb
' OFICINA (ANTES):
If MessageBox.Show("¿Cerrar aplicación?", "ATENCIÓN", MessageBoxButtons.YesNo, MessageBoxIcon.Question) = DialogResult.Yes Then
    ' código
End If

' PLANTA (DESPUÉS):
If Me.EnvioMensajePantalla("ATENCIÓN", "¿Cerrar aplicación?", MessageBoxButtons.YesNo, MessageBoxIcon.Question) = DialogResult.Yes Then
    ' código
End If
```

**⚠️ EXCEPCIÓN IMPORTANTE**:
NO convertir `MessageBox.Show` que muestren `ex.Message` (mensajes de excepción). Estos deben mantenerse tal cual:

```vb
' MANTENER SIN CAMBIOS:
Catch ex As Exception
    MessageBox.Show(ex.Message, "Exception", MessageBoxButtons.OK, MessageBoxIcon.Error)
    ' O también:
    MessageBox.Show(ex.ToString, "Exception", MessageBoxButtons.OK, MessageBoxIcon.Error)
End Try
```

**Tabla de correspondencia de parámetros:**

| Orden | MessageBox.Show | Me.EnvioMensajePantalla |
|-------|-----------------|-------------------------|
| 1° parámetro | Mensaje (texto) | **Título** |
| 2° parámetro | Título | **Mensaje** (texto) |
| 3° parámetro | Botones | Botones (igual) |
| 4° parámetro | Icono | Icono (igual) |

**Iconos comunes:**

- `MessageBoxIcon.Warning` → Advertencias
- `MessageBoxIcon.Error` → Errores
- `MessageBoxIcon.Information` → Información
- `MessageBoxIcon.Question` → Preguntas

**Botones comunes:**

- `MessageBoxButtons.OK` → Solo OK
- `MessageBoxButtons.YesNo` → Sí/No
- `MessageBoxButtons.OKCancel` → OK/Cancelar

#### 3.5. Simplificar Menús y Filtros

Los forms de planta suelen eliminar:

- MenuStrip (se reemplaza por botones directos)
- Filtros complejos (IdsFtrCodCentr, IdsFtrCodAlmac, etc.)
- SplitContainers con paneles de filtros

Mantén solo la funcionalidad esencial visible en planta.

#### 3.6. Adaptar Eventos de Grid

```vb
' El grid de Enntte puede tener eventos ligeramente diferentes
Private Sub idsGrd_AfterRowActivate(sender As Object, e As EventArgs) Handles idsGrd.AfterRowActivate
    ' Lógica del evento
End Sub
```

### 4. Crear la Clase BS (Business Service)

Crea `clsFrm[Nombre]PlantaBS.vb` en la carpeta `BS/`:

```vb
Imports System.Data
Imports IDS.ModEstandar.BaseIDS
Imports IDS.ModEstandar.BaseIDS.clsttHandleIDS

Public Class clsFrm[Nombre]PlantaBS
    
    ' Funciones de acceso a datos
    Public Function ObtenerDatos() As DataTable
        ' Implementación
    End Function
    
    Public Function GuardarRegistro(datos As Dictionary(Of String, Object)) As Boolean
        Try
            Dim mt As IMetaclase = BaseIds.BaseBS.CargarMetaClase("TABLA")
            ' Asignar valores
            For Each kvp In datos
                mt.Valor(kvp.Key) = kvp.Value
            Next
            Return mt.InsertarRegistro()
        Catch ex As Exception
            EscribirTraza(999, ex.Message, 999, System.Environment.MachineName, 
                         System.Environment.UserName, "clsFrm[Nombre]PlantaBS - GuardarRegistro", 
                         ex.ToString)
            Return False
        End Try
    End Function
    
    Public Function ActualizarRegistro(id As Integer, datos As Dictionary(Of String, Object)) As Boolean
        ' Implementación similar
    End Function
    
    Public Function EliminarRegistro(id As Integer) As Boolean
        ' Implementación
    End Function
    
    ' Funciones de lógica de negocio
    Public Function ValidarDatos(datos As Dictionary(Of String, Object)) As Boolean
        ' Validaciones
    End Function
    
    Public Function CalcularValor(parametros As Object) As Object
        ' Cálculos
    End Function
    
End Class
```

### 5. Migrar Funcionalidades Específicas

#### 5.1. Boletín (Socket)

Mantén la lógica de boletín, pero extrae la configuración a BS:

```vb
' En BS:
Public Function CargarInfoBoletinUrl() As String
    Try
        Dim strPath As String = ConfigHandler.LeerConfig("PathConfig")
        strPath &= "InfoBoletin.xml"
        Dim ds As New DataSet
        ds.ReadXml(strPath)
        If ds.Tables.Count > 0 Then
            If ds.Tables(0).Rows.Count > 0 Then
                Return ds.Tables(0).Rows(0)("Url").ToString()
            End If
        End If
    Catch ex As Exception
        EscribirTraza(999, ex.Message, 999, System.Environment.MachineName, 
                     System.Environment.UserName, "clsFrmBS - CargarInfoBoletinUrl", ex.ToString)
    End Try
    Return ""
End Function

' En el form:
Private Sub CargarInfoBoletin()
    g_strUrl = BS.CargarInfoBoletinUrl()
End Sub
```

#### 5.2. Auto-Refresh

Si el form de oficina tiene CheckBox para auto-refresh, en planta usa `DevExpress.XtraEditors.ToggleSwitch`:

```vb
' Declaración
Private WithEvents chkAutoRefresh As DevExpress.XtraEditors.ToggleSwitch

' Evento
Private Sub chkAutoRefresh_Toggled(sender As Object, e As EventArgs) Handles chkAutoRefresh.Toggled
    If chkAutoRefresh.IsOn Then
        Timer1.Start()
    Else
        Timer1.Stop()
    End If
End Sub
```

### 6. Ajustar Tamaños y Estilos

#### 6.1. Grid de Planta

Los grids de planta suelen tener fuentes más grandes:

```vb
Me.idsGrd.Font = New System.Drawing.Font("Verdana", 14.25!, System.Drawing.FontStyle.Regular)
Me.idsGrd.DisplayLayout.GroupByBox.PromptAppearance.FontData.SizeInPoints = 14.25!
```

#### 6.2. Botones de Planta

Los botones suelen ser más grandes y con colores distintivos:

```vb
' Configurar tamaño mínimo/máximo en LayoutControlItem
Me.lciBtnAccion.MaxSize = New System.Drawing.Size(9999, 80)
Me.lciBtnAccion.MinSize = New System.Drawing.Size(1, 80)
```

### 7. Eliminar Funcionalidades No Necesarias en Planta

Generalmente se eliminan:

- Opciones de exportación (XML, Excel)
- Filtros avanzados
- Menús complejos (Nuevo, Editar, Guardar, Cancelar) - SOLO si no tienen funciones o procedimientos asociados - Aquellos que pertenezcan al MenuStrip1 se deberian convertir en botones, exceptuando el boton de cerrar, exportar e importar- etc, pero las funciones de nuevo, guardar, y otras, que tengan asociados procesos diferentes a las funciones de "MyBase" se deberían convertir en botones y ponerlos en una zona de botones.
- Ayudas contextuales
- Campos de búsqueda avanzada

Se mantienen solo:

- Visualización de datos
- Acciones críticas (Start, End, Cancel, Delete) - tal y como veíamos anteriormente.
- Información esencial

### 8. Crear Archivos de Proyecto (.vbproj y .sln)

**CRÍTICO**: Estos archivos son OBLIGATORIOS para que Visual Studio pueda abrir y compilar el proyecto.

#### 8.1. Crear archivo .vbproj

Usa como base el `.vbproj` de `frmLoadPlanta` y modifica:

1. **Generar nuevo GUID** para el proyecto (usa un generador online o PowerShell):

   ```powershell
   [guid]::NewGuid().ToString().ToUpper()
   ```

2. **Actualizar nombres** en el archivo:
   - `<RootNamespace>Fagor.frm[Nombre]Planta</RootNamespace>`
   - `<AssemblyName>Fagor.frm[Nombre]Planta</AssemblyName>`
   - `<DocumentationFile>Fagor.frm[Nombre]Planta.xml</DocumentationFile>`
   - `<ProjectGuid>{NUEVO-GUID-AQUI}</ProjectGuid>`

3. **Actualizar referencias a archivos**:

   ```xml
   <ItemGroup>
     <Compile Include="Src\frm[Nombre]Planta.designer.vb">
       <DependentUpon>frm[Nombre]Planta.vb</DependentUpon>
     </Compile>
     <Compile Include="Src\frm[Nombre]Planta.vb">
       <SubType>Form</SubType>
     </Compile>
     <Compile Include="BS\clsFrm[Nombre]PlantaBS.vb" />
     <!-- ... resto de archivos My Project ... -->
   </ItemGroup>
   ```

4. **Actualizar recursos**:

   ```xml
   <ItemGroup>
     <EmbeddedResource Include="Src\frm[Nombre]Planta.resx">
       <DependentUpon>frm[Nombre]Planta.vb</DependentUpon>
       <SubType>Designer</SubType>
     </EmbeddedResource>
     <!-- ... resto de recursos ... -->
   </ItemGroup>
   ```

**Referencias esenciales que DEBE incluir**:

- `IDS.UI.VentanaBasePlantav2_0`
- `IDS.ModEstandar.Componentes_Enntte`
- `DevExpress.XtraLayout.v18.2`
- `DevExpress.XtraEditors.v18.2`
- `DevExpress.Utils.v18.2`
- `DevExpress.Data.v18.2`
- `Infragistics4.Win.UltraWinGrid.v12.1`
- `IDS.BoletinDatos.GlobalDefsBoletinDatos`
- `IDS.ModEstandar.ServicioEnntte`
- `IDS.ModMensajeria.GlobalDefsMensajeria`
- `IDS.UI.GOCPlantav2_0`
- `IDS.Utils.Constantes_Enntte`
- `IDS.UI.VentanaBaseProduccion_Enntte`
- `System.Net.Http`
- Todas las referencias específicas del proyecto (ej: `Fagor.PiezaPic`, `Fagor.srvGestorManipuladorST`)

#### 8.2. Crear archivo .sln

1. **Generar nuevo GUID** para la solución (diferente al del proyecto)

2. **Crear el archivo** con esta estructura:

   ```
   Microsoft Visual Studio Solution File, Format Version 12.00
   # Visual Studio Version 16
   VisualStudioVersion = 16.0.36602.28
   MinimumVisualStudioVersion = 10.0.40219.1
   Project("{F184B08F-C81C-45F6-A57F-5ABD9991F28F}") = "Fagor.frm[Nombre]Planta", "Fagor.frm[Nombre]Planta\Fagor.frm[Nombre]Planta.vbproj", "{GUID-DEL-PROYECTO}"
   EndProject
   Global
       GlobalSection(SolutionConfigurationPlatforms) = preSolution
           Debug|Any CPU = Debug|Any CPU
           Fagor|Any CPU = Fagor|Any CPU
           Release|Any CPU = Release|Any CPU
       EndGlobalSection
       GlobalSection(ProjectConfigurationPlatforms) = postSolution
           {GUID-DEL-PROYECTO}.Debug|Any CPU.ActiveCfg = Debug|Any CPU
           {GUID-DEL-PROYECTO}.Debug|Any CPU.Build.0 = Debug|Any CPU
           {GUID-DEL-PROYECTO}.Fagor|Any CPU.ActiveCfg = Fagor|Any CPU
           {GUID-DEL-PROYECTO}.Fagor|Any CPU.Build.0 = Fagor|Any CPU
           {GUID-DEL-PROYECTO}.Release|Any CPU.ActiveCfg = Release|Any CPU
           {GUID-DEL-PROYECTO}.Release|Any CPU.Build.0 = Release|Any CPU
       EndGlobalSection
       GlobalSection(SolutionProperties) = preSolution
           HideSolutionNode = FALSE
       EndGlobalSection
       GlobalSection(ExtensibilityGlobals) = postSolution
           SolutionGuid = {GUID-DE-LA-SOLUCION}
       EndGlobalSection
   EndGlobal
   ```

**IMPORTANTE**: El `{GUID-DEL-PROYECTO}` debe ser el MISMO que usaste en el `.vbproj`

#### 8.3. Actualizar AssemblyInfo.vb

Después de copiar los archivos de My Project, actualiza `AssemblyInfo.vb`:

```vb
<Assembly: AssemblyTitle("frm[Nombre]Planta")>
<Assembly: AssemblyDescription("Formulario de planta para [descripción]")>
<Assembly: AssemblyCompany("Fagor Arrasate")>
<Assembly: AssemblyProduct("frm[Nombre]Planta")>
<Assembly: AssemblyCopyright("Copyright © Fagor Arrasate 2026")>
<Assembly: Guid("guid-del-assembly")>  ' Generar nuevo GUID
```

#### 8.4. Crear README.md

Documenta el proyecto con:

- Descripción del formulario
- Estructura de archivos creados
- Funciones de la clase BS
- Componentes UI utilizados
- Layout y distribución
- Funcionalidades mantenidas vs eliminadas
- Configuración del proyecto (GUIDs, referencias)
- Próximos pasos para compilación y testing

### 9. Verificación y Testing

1. **Compilar el proyecto** y resolver errores de referencias
2. **Verificar que la clase BS** tiene todas las funciones necesarias
3. **Probar cada botón** y acción del formulario
4. **Validar el layout** en diferentes resoluciones
5. **Comprobar el auto-refresh** si aplica
6. **Verificar la comunicación** con boletín/socket si aplica
7. **Testear permisos** y visibilidad condicional de botones

**Validación Final de Funcionalidad**:

- Compara lado a lado (si es posible) o función por función con el original.
- ¿Hacen exactamente lo mismo al pulsar el botón X?
- ¿Se muestran los mismos datos en el Grid Y?
- ¿Los cálculos de la clase BS dan el mismo resultado?
- **NO** entregues el trabajo si falta alguna lógica crítica del original.

## Checklist de Conversión

- [ ] Estructura de carpetas creada (Src/, BS/, Resources/)
- [ ] Imports actualizados en designer y código
- [ ] Clase base cambiada a `clsVentanaBasePlanta`
- [ ] Componentes UI migrados a Componentes_Enntte
- [ ] LayoutControl implementado con DevExpress
- [ ] Todos los LayoutControlItems correctamente inicializados (BeginInit/EndInit)
- [ ] Clase BS creada con todas las funciones de datos
- [ ] Lógica de acceso a datos extraída del form a BS
- [ ] Eventos de controles adaptados
- [ ] Menús y filtros simplificados/eliminados
- [ ] Tamaños de fuente y controles ajustados para planta
- [ ] Settings.Designer.vb con namespace correcto
- [ ] Resources.resx copiado del formulario original
- [ ] Carpeta Resources/ con todos los iconos
- [ ] frm[Nombre]Planta.resx copiado del original
- [ ] Auto-refresh implementado (si aplica)
- [ ] Boletín configurado (si aplica)
- [ ] Proyecto compila sin errores
- [ ] Funcionalidad probada y verificada

## Notas Importantes

1. **Separación de responsabilidades**: El form debe ocuparse SOLO de la UI. Toda lógica de datos y negocio va en la clase BS.

2. **Simplicidad en planta**: Los forms de planta son versiones simplificadas para uso en producción. Elimina complejidad innecesaria.

3. **DevExpress LayoutControl**: Permite diseños responsivos y profesionales. Usa el diseñador visual para configurar el layout.

4. **Componentes Enntte**: Son versiones optimizadas para planta. Respeta sus propiedades específicas (IDS_TEXT, IDS_IMAGE, etc.).

5. **Manejo de errores**: Siempre usa try-catch en la clase BS y registra errores con `EscribirTraza`.

6. **Recursos compartidos**: Las imágenes y recursos deben estar en la carpeta Resources del proyecto.

7. **⚠️ SIEMPRE copiar desde el formulario ORIGINAL**: Los archivos `.resx`, `Resources/`, `Settings.Designer.vb` y `Resources.Designer.vb` DEBEN copiarse del formulario original de oficina, NO de otro proyecto de planta.

## Ejemplo de Referencia

Para ver un ejemplo completo de conversión, compara:

- **Oficina**: `c:\ProyectosGIT\Fagor Arrasate\FAGOR_SPLITTER_TOOLS\UI\Fagor.frmPines`
- **Planta**: `c:\ProyectosGIT\Fagor Arrasate\FAGOR_SPLITTER_TOOLS\UI\Fagor.frmPinesPlanta`
