/**
 * ============================================================
 * Google Apps Script — Backend para Invitaciones XV Años
 * ============================================================
 * 
 * INSTRUCCIONES:
 * 1. Abre tu Google Sheet
 * 2. Ve a Extensiones > Apps Script
 * 3. Borra el contenido predeterminado
 * 4. Copia y pega TODO este código
 * 5. Guarda (Ctrl+S)
 * 6. Publica: Implementar > Nueva implementación
 *    - Tipo: Aplicación web
 *    - Ejecutar como: Yo
 *    - Acceso: Cualquier persona
 * 7. Copia la URL generada y pégala en script.js (CONFIG.rsvpEndpoint)
 * 
 * ESTRUCTURA ESPERADA DEL SHEET:
 * Columna A: Nombre del invitado
 * Columna B: Número de pases
 * Columna C: Enlace generado (fórmula)
 * Columna D: Confirmación (se llena con este script)
 * Columna E: Fecha de confirmación (se llena con este script)
 */

// =============================================
// POST — Recibe confirmaciones desde la invitación web
// =============================================
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);

    var id = data.id || '';
    var nombre = data.nombre || '';
    var pases = data.pases || '';
    var respuesta = data.respuesta || 'Confirmado';
    var fechaConfirmacion = data.fecha_confirmacion || new Date().toISOString();

    // Buscar al invitado por su slug (id) en la columna C (enlaces)
    var lastRow = sheet.getLastRow();
    var encontrado = false;

    for (var i = 2; i <= lastRow; i++) { // Empieza en fila 2 (fila 1 = encabezados)
      var enlace = sheet.getRange(i, 3).getValue().toString().toLowerCase();

      // Buscar si el enlace contiene el id del invitado
      if (enlace.indexOf('id=' + id) !== -1) {
        // Escribir confirmación en Columna D
        sheet.getRange(i, 4).setValue(respuesta);
        // Escribir fecha en Columna E
        sheet.getRange(i, 5).setValue(fechaConfirmacion);
        encontrado = true;
        break;
      }
    }

    // Si no se encontró por enlace, buscar por nombre (slug vs nombre)
    if (!encontrado) {
      for (var j = 2; j <= lastRow; j++) {
        var nombreSheet = sheet.getRange(j, 1).getValue().toString();
        var slugSheet = slugify(nombreSheet);

        if (slugSheet === id) {
          sheet.getRange(j, 4).setValue(respuesta);
          sheet.getRange(j, 5).setValue(fechaConfirmacion);
          encontrado = true;
          break;
        }
      }
    }

    // Si aún no se encontró, agregar como nueva fila
    if (!encontrado) {
      sheet.appendRow([nombre, pases, '', respuesta, fechaConfirmacion]);
    }

    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'ok',
        message: encontrado ? 'Confirmación registrada' : 'Invitado nuevo agregado',
        id: id
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// =============================================
// GET — Verificar que el script está activo
// =============================================
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'ok',
      message: 'Backend de invitaciones activo',
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// =============================================
// Utilidad: Convertir nombre a slug
// =============================================
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quitar acentos
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}
