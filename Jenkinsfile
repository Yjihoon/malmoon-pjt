pipeline {
    agent any

    environment {
        REACT_DIR = 'apps/frontend'
        SPRING_DIR = 'apps/backend'
        DOCKER_IMAGE_NAME = 'myapp:latest'
    }

    stages {
        stage('Git Checkout') {
            steps {
                echo '✅ Git 저장소에서 코드 가져오는 중...'
                checkout scm
            }
        }

        stage('Frontend Build') {
            steps {
                dir("${REACT_DIR}") {
                    echo '⚙️ React 빌드 시작'
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }

        stage('Backend Build') {
            steps {
                dir("${SPRING_DIR}") {
                    echo '🛠️ Spring Boot 빌드 시작'
                    sh './gradlew clean build'
                }
            }
        }

        stage('Docker Build') {
            steps {
                echo '🐳 Docker 이미지 빌드 중...'
                sh 'docker build -t ${DOCKER_IMAGE_NAME} .'
            }
        }
    }
}
