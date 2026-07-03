# =====================================================================
# Script para compartir la invitacion de XV Anos localmente via un tunel
# =====================================================================

$port = 8000

Clear-Host
Write-Host "==========================================================" -ForegroundColor Magenta
Write-Host "  COMPARTIR INVITACION - XV ANOS DE MAYLI GUADALUPE       " -ForegroundColor Yellow -BackgroundColor DarkBlue
Write-Host "==========================================================" -ForegroundColor Magenta
Write-Host ""

# Verificar si Python esta instalado
$pythonCheck = Get-Command python -ErrorAction SilentlyContinue
if (-not $pythonCheck) {
    Write-Host "[ERROR] Python no esta instalado o no se encuentra en el PATH." -ForegroundColor Red
    Write-Host "Por favor instala Python e intentalo de nuevo." -ForegroundColor Yellow
    Exit
}

# Iniciar servidor web de Python en segundo plano
Write-Host "[1/3] Iniciando servidor web local en el puerto $port..." -ForegroundColor Cyan
$process = Start-Process python -ArgumentList "-m http.server $port" -NoNewWindow -PassThru -ErrorAction SilentlyContinue

if (-not $process) {
    Write-Host "[ERROR] No se pudo iniciar el servidor web de Python." -ForegroundColor Red
    Exit
}

# Esperar un momento a que el servidor inicie
Start-Sleep -Seconds 1

Write-Host "[OK] Servidor local corriendo en http://localhost:$port" -ForegroundColor Green
Write-Host ""
Write-Host "----------------------------------------------------------" -ForegroundColor Gray
Write-Host "Selecciona el servicio de tunel que deseas utilizar:" -ForegroundColor Yellow
Write-Host "1) Pinggy.io (Recomendado - Genera Codigo QR en consola)" -ForegroundColor Green
Write-Host "2) Localhost.run" -ForegroundColor White
Write-Host "3) Serveo.net" -ForegroundColor White
Write-Host "----------------------------------------------------------" -ForegroundColor Gray
Write-Host ""

$choice = Read-Host "Elige una opcion (1-3)"

Write-Host ""
Write-Host "[2/3] Creando tunel publico seguro..." -ForegroundColor Cyan
Write-Host "----------------------------------------------------------" -ForegroundColor Gray
Write-Host "INSTRUCCIONES:" -ForegroundColor Yellow
Write-Host "1. Copia la URL publica (https://...) generada en la pantalla." -ForegroundColor White
Write-Host "2. Abre esa URL en tu navegador seguido de /generar_links.html" -ForegroundColor White
Write-Host "   (Ejemplo: https://tu-subdominio.pinggy.link/generar_links.html)" -ForegroundColor White
Write-Host "3. Desde alli podras ingresar nombres y generar enlaces listos para WhatsApp!" -ForegroundColor White
Write-Host "4. Para apagar el tunel y el servidor, presiona Ctrl+C en esta consola." -ForegroundColor Red
Write-Host "----------------------------------------------------------" -ForegroundColor Gray
Write-Host ""

try {
    # Ejecutar tunel segun la opcion elegida
    if ($choice -eq "2") {
        Write-Host "Estableciendo tunel con Localhost.run..." -ForegroundColor Yellow
        ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=NUL -R 80:localhost:$port nokey@localhost.run
    }
    elseif ($choice -eq "3") {
        Write-Host "Estableciendo tunel con Serveo.net..." -ForegroundColor Yellow
        ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=NUL -R 80:localhost:$port serveo.net
    }
    else {
        Write-Host "Estableciendo tunel con Pinggy.io (Generando QR)..." -ForegroundColor Yellow
        ssh -p 443 -o StrictHostKeyChecking=no -o UserKnownHostsFile=NUL -R0:localhost:$port qr@pinggy.io
    }
}
finally {
    # Detener servidor web local al cerrar el script o presionar Ctrl+C
    Write-Host "`n[3/3] Cerrando servidor local de Python..." -ForegroundColor Cyan
    if ($process) {
        Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
        Write-Host "[OK] Servidor de Python detenido." -ForegroundColor Green
    }
    Write-Host "Tunel cerrado correctamente!" -ForegroundColor Magenta
}
