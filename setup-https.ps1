# Script para configurar HTTPS en Docker
# Ejecutar en PowerShell como Administrador

Write-Host "=== Configuración de HTTPS para Docker ===" -ForegroundColor Green

# 1. Crear volúmenes externos de Docker
Write-Host "`n1. Creando volúmenes de Docker..." -ForegroundColor Yellow
docker volume create sgu-volume
docker volume create certbot-conf

# 2. Crear red externa
Write-Host "`n2. Creando red de Docker..." -ForegroundColor Yellow
docker network create sgu-net

# 3. Verificar si mkcert está instalado
Write-Host "`n3. Verificando mkcert..." -ForegroundColor Yellow
if (-not (Get-Command mkcert -ErrorAction SilentlyContinue)) {
    Write-Host "mkcert no está instalado. Instalando..." -ForegroundColor Red
    Write-Host "Por favor instala mkcert manualmente:" -ForegroundColor Yellow
    Write-Host "  choco install mkcert" -ForegroundColor Cyan
    Write-Host "  O descarga desde: https://github.com/FiloSottile/mkcert/releases" -ForegroundColor Cyan
    Write-Host "`nDespués de instalar, ejecuta: mkcert -install" -ForegroundColor Yellow
    exit 1
}

# 4. Crear directorio temporal para certificados
Write-Host "`n4. Generando certificados SSL..." -ForegroundColor Yellow
$tempCertDir = "$env:TEMP\sgu-certs"
New-Item -ItemType Directory -Force -Path $tempCertDir | Out-Null

# 5. Generar certificados con mkcert
Write-Host "Generando certificados para localhost..." -ForegroundColor Cyan
mkcert -key-file "$tempCertDir\privkey.pem" -cert-file "$tempCertDir\fullchain.pem" localhost 127.0.0.1 ::1

# 6. Crear estructura de directorios para Let's Encrypt
Write-Host "`n5. Preparando estructura de directorios..." -ForegroundColor Yellow
$letsencryptDir = "$tempCertDir\live\localhost"
New-Item -ItemType Directory -Force -Path $letsencryptDir | Out-Null

# Mover certificados a la estructura correcta
Move-Item -Force "$tempCertDir\privkey.pem" "$letsencryptDir\privkey.pem"
Move-Item -Force "$tempCertDir\fullchain.pem" "$letsencryptDir\fullchain.pem"

# 7. Convertir certificado a PKCS12 para Java (keystore)
Write-Host "`n6. Convirtiendo certificado a formato PKCS12 para Java..." -ForegroundColor Yellow
$keystorePath = "$letsencryptDir\keystore.p12"
$keystorePassword = "changeit"

# Verificar si openssl está disponible
if (Get-Command openssl -ErrorAction SilentlyContinue) {
    openssl pkcs12 -export -in "$letsencryptDir\fullchain.pem" -inkey "$letsencryptDir\privkey.pem" -out "$keystorePath" -name "localhost" -password "pass:$keystorePassword" -noiter -nomaciter
    Write-Host "Keystore creado exitosamente" -ForegroundColor Green
} else {
    Write-Host "OpenSSL no está disponible. Necesitarás convertir el certificado manualmente:" -ForegroundColor Red
    Write-Host "  openssl pkcs12 -export -in fullchain.pem -inkey privkey.pem -out keystore.p12 -name localhost -password pass:changeit" -ForegroundColor Cyan
    Write-Host "`nO instala OpenSSL:" -ForegroundColor Yellow
    Write-Host "  choco install openssl" -ForegroundColor Cyan
}

# 8. Copiar certificados al volumen de Docker
Write-Host "`n7. Copiando certificados al volumen de Docker..." -ForegroundColor Yellow

# Crear un contenedor temporal para copiar archivos al volumen
$tempContainer = "temp-cert-copy-$(Get-Random)"
docker run -d --name $tempContainer -v certbot-conf:/data alpine tail -f /dev/null

# Copiar archivos
docker cp "$tempCertDir\live\localhost\." "$tempContainer:/data/live/localhost/"

# Limpiar contenedor temporal
docker rm -f $tempContainer

# 9. Limpiar archivos temporales
Write-Host "`n8. Limpiando archivos temporales..." -ForegroundColor Yellow
Remove-Item -Recurse -Force $tempCertDir

Write-Host "`n=== Configuración completada ===" -ForegroundColor Green
Write-Host "`nAhora puedes ejecutar:" -ForegroundColor Yellow
Write-Host "  docker-compose up -d" -ForegroundColor Cyan
Write-Host "`nTu aplicación estará disponible en:" -ForegroundColor Yellow
Write-Host "  Frontend: https://localhost:3443" -ForegroundColor Cyan
Write-Host "  Backend: https://localhost:8081/sgu-api" -ForegroundColor Cyan

