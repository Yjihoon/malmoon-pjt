pipeline {
    agent any

    environment {
        IMAGE_NAME = 'your-dockerhub-id/your-project'  // 원하면 EC2 전용 이름도 가능
        CONTAINER_NAME = 'your-app-container'
    }

    stages {
        stage('Git Checkout') {
            steps {
                echo '✅ GitLab에서 프로젝트 코드 가져오는 중...'
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
