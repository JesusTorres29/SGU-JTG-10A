# Configuración de HTTPS para Docker

Este documento explica cómo configurar HTTPS para tu aplicación Docker.

## Prerrequisitos

1. **Docker Desktop** instalado y ejecutándose
2. **mkcert** instalado (recomendado para desarrollo local)
   - Windows: `choco install mkcert` o descargar desde [GitHub](https://github.com/FiloSottile/mkcert/releases)
   - Después de instalar: `mkcert -install`
3. **OpenSSL** (para convertir certificados a PKCS12)
   - Windows: `choco install openssl`

## Opción 1: Script Automático (Recomendado)

Ejecuta el script PowerShell como Administrador:

```powershell
.\setup-https.ps1
```

## Opción 2: Comandos Manuales

### Paso 1: Crear volúmenes y red de Docker

```powershell
# Crear volúmenes
docker volume create sgu-volume
docker volume create certbot-conf

# Crear red
docker network create sgu-net
```

### Paso 2: Generar certificados SSL

#### Con mkcert (Recomendado para desarrollo):

```powershell
# Instalar certificado raíz (solo una vez)
mkcert -install

# Crear directorio temporal
mkdir $env:TEMP\sgu-certs\live\localhost

# Generar certificados
mkcert -key-file "$env:TEMP\sgu-certs\live\localhost\privkey.pem" -cert-file "$env:TEMP\sgu-certs\live\localhost\fullchain.pem" localhost 127.0.0.1 ::1
```

#### Con OpenSSL (Alternativa):

```powershell
# Crear directorio
mkdir $env:TEMP\sgu-certs\live\localhost

# Generar clave privada
openssl genrsa -out "$env:TEMP\sgu-certs\live\localhost\privkey.pem" 2048

# Generar certificado autofirmado
openssl req -new -x509 -key "$env:TEMP\sgu-certs\live\localhost\privkey.pem" -out "$env:TEMP\sgu-certs\live\localhost\fullchain.pem" -days 365 -subj "/CN=localhost"
```

### Paso 3: Convertir certificado a PKCS12 para Java

```powershell
openssl pkcs12 -export -in "$env:TEMP\sgu-certs\live\localhost\fullchain.pem" -inkey "$env:TEMP\sgu-certs\live\localhost\privkey.pem" -out "$env:TEMP\sgu-certs\live\localhost\keystore.p12" -name "localhost" -password "pass:changeit" -noiter -nomaciter
```

### Paso 4: Copiar certificados al volumen de Docker

```powershell
# Crear contenedor temporal
docker run -d --name temp-cert-copy -v certbot-conf:/data alpine tail -f /dev/null

# Copiar certificados
docker cp "$env:TEMP\sgu-certs\live\localhost\." temp-cert-copy:/data/live/localhost/

# Limpiar
docker rm -f temp-cert-copy

# Limpiar archivos temporales
Remove-Item -Recurse -Force $env:TEMP\sgu-certs
```

### Paso 5: Construir y ejecutar contenedores

```powershell
# Construir imágenes
docker-compose build

# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f
```

## Verificación

Una vez que los contenedores estén ejecutándose:

1. **Frontend**: https://localhost:3443
2. **Backend API**: https://localhost:8081/sgu-api

## Solución de Problemas

### Error: "Volume not found"
```powershell
docker volume create certbot-conf
docker volume create sgu-volume
docker network create sgu-net
```

### Error: "Certificate not found"
Verifica que los certificados estén en el volumen:
```powershell
docker run --rm -v certbot-conf:/data alpine ls -la /data/live/localhost/
```

### Error: "Keystore not found"
Asegúrate de haber convertido el certificado a PKCS12:
```powershell
docker run --rm -v certbot-conf:/data alpine ls -la /data/live/localhost/keystore.p12
```

### Reconstruir certificados
Si necesitas regenerar los certificados:
```powershell
# Eliminar volumen de certificados
docker volume rm certbot-conf

# Recrear volumen
docker volume create certbot-conf

# Repetir pasos 2-4
```

## Notas Importantes

- Los certificados generados con `mkcert` son válidos para desarrollo local
- Para producción, usa certificados de Let's Encrypt o una CA confiable
- El puerto 3443 se usa para HTTPS del frontend (443 está reservado en Windows)
- El backend escucha en el puerto 8081 (mapeado desde 8080 del contenedor)

