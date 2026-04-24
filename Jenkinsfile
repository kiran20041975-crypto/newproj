pipeline {
    agent any
    environment {
        IMAGE_NAME = "kiran20041975/nodejs-app"
        IMAGE_TAG = "${BUILD_NUMBER}"
    }
    stages {
        stage('Checkout') {
            steps {
                git 'https://github.com/kiran20041975-crypto/newproj'
            }
        }
        stage('Install & Test') {
            steps {
                sh '''
                npm ci
                npm test
                '''
            }
        }
        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} ."
            }
        }
        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                    echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                    docker push ${IMAGE_NAME}:${IMAGE_TAG}
                    docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${IMAGE_NAME}:latest
                    docker push ${IMAGE_NAME}:latest
                    '''
                }
            }
        }
        stage('Deploy to Kubernetes') {
            steps {
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
                    sh '''
                    export KUBECONFIG=$KUBECONFIG
                    kubectl set image deployment/nodejs-app \
                    nodejs-app=${IMAGE_NAME}:${IMAGE_TAG}
                    kubectl rollout status deployment/nodejs-app
                    '''
                }
            }
        }
    }
    post {
        success {
            echo 'Pipeline succeeded! App deployed.'
        }
        failure {
            echo 'Pipeline failed. Check logs.'
        }
    }
}