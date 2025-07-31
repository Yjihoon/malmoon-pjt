pipeline {
    agent any

    options {
        skipDefaultCheckout(true) // 자동 checkout 방지
    }

    environment {
        IMAGE_NAME = '정형진/docker-frontend' // 실제 DockerHub 계정/이미지명
        CONTAINER_NAME = 'frontend-container'
    }

    stages {
        stage('Clean Workspace') {
            steps {
                echo '🧼 이전 작업공간 정리 중...'
                cleanWs()
            }
        }

        stage('Git Checkout') {
            steps {
                echo '📥 Git 저장소 다시 clone 중...'
                checkout scm
            }
        }

        stage('Docker Build') {
            steps {
                echo '🐳 Docker 이미지 빌드 중...'
                sh """
                    docker build -t $IMAGE_NAME .
                """
            }
        }

        stage('Stop Old Container') {
            steps {
                echo '🧹 기존 컨테이너 정리 중...'
                sh """
                    docker stop $CONTAINER_NAME || true
                    docker rm $CONTAINER_NAME || true
                """
            }
        }

        stage('Run New Container') {
            steps {
                echo '🚀 새 컨테이너 실행 중...'
                sh """
                    docker run -d --name $CONTAINER_NAME -p 80:80 $IMAGE_NAME
                """
            }
        }
    }
}
