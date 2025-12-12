pipeline {
  agent any

  stages {
    stage('Checkout SCM') {
      steps {
        checkout scm
      }
    }

    stage('Parando servicios') {
      steps {
        bat '''
            @echo off
            cd /d %WORKSPACE%
            echo Deteniendo y eliminando contenedores existentes...
            docker compose down --remove-orphans || exit 0
            docker stop sgu-database sgu-backend sgu-frontend 2>nul || echo No hay contenedores corriendo
            docker rm sgu-database sgu-backend sgu-frontend 2>nul || echo Contenedores ya eliminados
        '''
      }
    }

    stage('Preparando recursos Docker') {
      steps {
        bat '''
            @echo off
            echo Creando volúmenes y red si no existen...
            docker volume create sgu-volume 2>nul || echo Volumen sgu-volume ya existe
            docker volume create certbot-conf 2>nul || echo Volumen certbot-conf ya existe
            docker network create sgu-net 2>nul || echo Red sgu-net ya existe
            
            echo Verificando certificados SSL...
            docker run --rm -v certbot-conf:/data alpine ls /data/live/localhost/ 2>nul
            if errorlevel 1 (
                echo Generando certificados SSL...
                docker run -d --name temp-cert-setup -v certbot-conf:/data alpine tail -f /dev/null
                docker exec temp-cert-setup sh -c "apk add --no-cache openssl && mkdir -p /data/live/localhost && cd /data/live/localhost && openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout privkey.pem -out fullchain.pem -subj '/CN=localhost' -addext 'subjectAltName=DNS:localhost,DNS:127.0.0.1,IP:127.0.0.1' && openssl pkcs12 -export -in fullchain.pem -inkey privkey.pem -out keystore.p12 -name localhost -password pass:changeit -noiter -nomaciter"
                docker rm -f temp-cert-setup
                echo Certificados generados
            ) else (
                echo Certificados ya existen
            )
        '''
      }
    }

    stage('Eliminando imagenes antiguas...') {
        steps {
            bat '''
                @echo off
                for /f "tokens=*" %%i in ('docker images --filter "label=com.docker.compose.project=demo" -q 2^>nul') do (
                    docker rmi -f %%i
                )
                echo Verificando imagenes antiguas del proyecto...
            '''
        }
    }

    stage('Descargando actualizacion...') {
        steps {
            checkout scm 
        }
    }

    stage('Construyendo y desplegando') {
      steps {
        bat '''
            @echo off
            cd /d %WORKSPACE%
            echo Construyendo imágenes...
            docker compose build
            if errorlevel 1 (
                echo Error al construir las imágenes
                exit 1
            )
            echo Eliminando contenedores existentes antes de iniciar...
            docker stop sgu-database sgu-backend sgu-frontend 2>nul
            docker rm sgu-database sgu-backend sgu-frontend 2>nul
            echo Iniciando servicios...
            docker compose up -d
            if errorlevel 1 (
                echo Error al iniciar los servicios
                exit 1
            )
            echo Servicios iniciados correctamente
            timeout /t 5 /nobreak >nul
            docker compose ps
        '''
      }
    }
  }

  post {
    always { echo 'Pipeline finalizada.' }
    success { echo 'OK.' }
    failure { echo 'Falló.' }
  }
}
