# =====================================================================
# sincronizar.ps1 — Sync archivos del IDE al repositorio Git
# Ejecuta este script antes de hacer "Commit" en GitHub Desktop
# =====================================================================

$source = "C:\Users\marco\Documents\Invitacion"
$dest   = "C:\Users\marco\Documents\Invitacion\Invitacion"

Clear-Host
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "  SINCRONIZAR → GitHub Pages            " -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Magenta
Write-Host ""

# Copiar archivos sueltos (excluir la subcarpeta Invitacion y archivos .git)
$archivos = Get-ChildItem $source -File | Where-Object {
    $_.Name -ne "sincronizar.ps1"
}

foreach ($archivo in $archivos) {
    Copy-Item $archivo.FullName -Destination $dest -Force
    Write-Host "  ✓ $($archivo.Name)" -ForegroundColor Green
}

# Copiar carpeta assets
if (Test-Path "$source\assets") {
    Copy-Item "$source\assets" -Destination "$dest\assets" -Recurse -Force
    Write-Host "  ✓ assets/ (imágenes y música)" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "  ¡Listo! Ahora en GitHub Desktop:" -ForegroundColor Yellow
Write-Host "  1. Escribe un mensaje de commit" -ForegroundColor White
Write-Host "  2. Clic en 'Commit to main'" -ForegroundColor White
Write-Host "  3. Clic en 'Push origin'" -ForegroundColor White
Write-Host "  4. Espera ~1 min y recarga tu URL" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "URL: https://marcomartinez17.github.io/invitacion/" -ForegroundColor Cyan
Write-Host ""
Read-Host "Presiona Enter para cerrar"
