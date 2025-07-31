pipeline {
    agent any

    options {
        skipDefaultCheckout(true) // ← 이게 핵심!
    }

    environment {
        IMAGE_NAME = 'your-dockerhub-id/your-project'
        CONTAINER_NAME = 'your-app-container'
    }

    stages {
        stage('Clean Workspace') {
            steps {
                echo '🧼 이전 작업공간 정리 중...'
                cleanWs()
            }
        }

        // Git Checkout 명시적으로 하지 않음

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
