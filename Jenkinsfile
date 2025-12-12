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
        bat 'docker compose down || exit 0'
      }
    }

    stage('Eliminando imagenes antiguas...') {
        steps {
            bat '''
                @echo off
                for /f "tokens=*" %%i in ('docker images --filter "label=com.docker.compose.project=demo" -q') do (
                    docker rmi -f %%i
                )
                if errorlevel 1 (
                    echo No hay imagenes por borrar
                )
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
        bat 'docker compose up --build -d'
      }
    }
  }

  post {
    always { echo 'Pipeline finalizada.' }
    success { echo 'OK.' }
    failure { echo 'Falló.' }
  }
}
