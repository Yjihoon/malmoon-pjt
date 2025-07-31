pipeline {
    agent any

    environment {
        IMAGE_NAME = 'my-frontend-image'       // 로컬 전용 Docker 이미지 이름
        CONTAINER_NAME = 'frontend-container'  // 실행할 컨테이너 이름
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
