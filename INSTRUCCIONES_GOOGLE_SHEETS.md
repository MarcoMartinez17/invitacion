# 📋 Guía: Configurar Google Sheets como Backend

Sigue estos pasos para conectar tu invitación web con Google Sheets.  
**Tiempo estimado: 5-10 minutos.**

---

## Paso 1: Crear el Google Sheet

1. Ve a [Google Sheets](https://sheets.google.com) y crea una nueva hoja de cálculo
2. Renómbrala a: **"Invitados XV Mayli"** (o el nombre que prefieras)
3. En la **Fila 1** (encabezados), escribe:

| Celda | Valor |
|-------|-------|
| A1 | **Nombre** |
| B1 | **Pases** |
| C1 | **Enlace** |
| D1 | **Confirmó** |
| E1 | **Fecha Confirmación** |

---

## Paso 2: Fórmula para generar enlaces automáticamente

En la celda **C2**, pega esta fórmula:

```
=SI(A2="","",HIPERVINCULO(CONCATENAR("https://TU-URL-AQUI/?id=",SUSTITUIR(SUSTITUIR(SUSTITUIR(SUSTITUIR(SUSTITUIR(SUSTITUIR(SUSTITUIR(MINUSC(ESPACIOS(A2))," ","-"),"á","a"),"é","e"),"í","i"),"ó","o"),"ú","u"),"ñ","n"),"&pases=",B2),"🔗 Abrir"))
```

> **⚠️ IMPORTANTE:** Reemplaza `TU-URL-AQUI` con la URL real de tu invitación.  
> Ejemplo: `https://abc123.pinggy.link`

### ¿Cómo funciona?
- Toma el nombre de la columna A (ej: "Juan Pérez")
- Lo convierte a slug: `juan-perez`
- Genera: `https://tu-url/?id=juan-perez&pases=2`
- Lo muestra como un enlace clickeable "🔗 Abrir"

### Copiar la fórmula hacia abajo
1. Selecciona la celda C2
2. Arrastra el cuadrito azul de la esquina inferior derecha hacia abajo
3. La fórmula se aplicará a todas las filas donde haya un nombre

---

## Paso 3: Agregar invitados

Simplemente llena las columnas A y B:

| A (Nombre) | B (Pases) | C (Enlace) | D | E |
|------------|-----------|-------------|---|---|
| Juan Pérez | 2 | *(se genera solo)* | | |
| Familia García | 5 | *(se genera solo)* | | |
| María López | 1 | *(se genera solo)* | | |

---

## Paso 4: Crear el Google Apps Script

1. Desde tu Google Sheet, ve a **Extensiones > Apps Script**
2. Se abrirá el editor de Apps Script
3. **Borra** todo el código que aparece por defecto (`function myFunction()...`)
4. Abre el archivo `google_apps_script.js` de tu proyecto
5. **Copia todo el contenido** y pégalo en el editor de Apps Script
6. Presiona **Ctrl+S** para guardar
7. Dale un nombre al proyecto: "Backend Invitaciones"

---

## Paso 5: Publicar como Aplicación Web

1. En el editor de Apps Script, haz clic en **Implementar** (botón azul arriba a la derecha)
2. Selecciona **Nueva implementación**
3. En "Tipo", selecciona el ⚙️ engrane y elige **Aplicación web**
4. Configura:
   - **Descripción**: "Backend invitaciones XV"
   - **Ejecutar como**: "Yo" (tu cuenta)
   - **Quién tiene acceso**: **"Cualquier persona"**
5. Haz clic en **Implementar**
6. Google te pedirá autorización → Acepta los permisos
7. **Copia la URL** que te muestra (algo como: `https://script.google.com/macros/s/XXXX/exec`)

---

## Paso 6: Conectar con tu invitación

1. Abre el archivo `script.js` de tu proyecto
2. Busca la línea con `rsvpEndpoint` (línea ~19):
   ```javascript
   rsvpEndpoint: 'https://formspree.io/f/TU_FORM_ID',
   ```
3. Reemplázala con tu URL de Apps Script:
   ```javascript
   rsvpEndpoint: 'https://script.google.com/macros/s/TU_ID_AQUI/exec',
   ```
4. Guarda el archivo

---

## Paso 7: Probar

1. Inicia tu servidor local con `compartir.ps1`
2. Abre la invitación con parámetros de prueba:  
   `http://localhost:8000/?id=juan-perez&pases=2`
3. Desliza el slider de confirmación
4. Revisa tu Google Sheet → Debería aparecer "Confirmado" en la columna D

---

## ❓ Solución de problemas

| Problema | Solución |
|----------|----------|
| "Error de CORS" en consola | Esto es normal con Apps Script. El envío funciona aunque la consola muestre este error. Verifica en el Sheet. |
| No aparece la confirmación | Verifica que la URL del Apps Script esté correcta y que publicaste como "Cualquier persona" |
| La fórmula no genera el enlace | Revisa que reemplazaste `TU-URL-AQUI` con tu URL real |
| Quiero actualizar el script | En Apps Script, ve a Implementar > Gestionar implementaciones > Editar > Nueva versión |

---

## 🔄 Exportar desde generar_links.html

Si ya tienes invitados guardados en `generar_links.html`, puedes exportarlos como CSV:
1. Abre `generar_links.html`
2. Haz clic en el botón **"Exportar CSV"**
3. Se descargará un archivo `invitados_xv.csv`
4. En Google Sheets: **Archivo > Importar > Subir** → selecciona el CSV
5. Elige "Insertar en filas nuevas" para no perder tus datos
