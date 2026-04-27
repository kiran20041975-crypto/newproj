
pipeline {
  agent any

  environment {
    AWS_REGION = 'ap-south-1'
    ECR_REPO = '782296988341.dkr.ecr.ap-south-1.amazonaws.com/nodejs-app'
    IMAGE_TAG = "${BUILD_NUMBER}"
  }

  stages {

    stage('Checkout') {
      steps {
        git branch: 'main', url: 'https://github.com/YOUR_USERNAME/nodejs-app.git'
      }
    }

    stage('Install & Test') {
      steps {
        sh 'npm install'
        sh 'npm test'
      }
    }

    stage('Docker Build') {
      steps {
        sh "docker build -t nodejs-app:${IMAGE_TAG} ."
      }
    }

    stage('Push to ECR') {
      steps {
        sh """
          aws ecr get-login-password --region ${AWS_REGION} | \
          docker login --username AWS --password-stdin \
          782296988341.dkr.ecr.ap-south-1.amazonaws.com

          docker tag nodejs-app:${IMAGE_TAG} ${ECR_REPO}:${IMAGE_TAG}
          docker tag nodejs-app:${IMAGE_TAG} ${ECR_REPO}:latest
          docker push ${ECR_REPO}:${IMAGE_TAG}
          docker push ${ECR_REPO}:latest
        """
      }
    }

    stage('Deploy to EKS') {
      steps {
        sh """
          aws eks update-kubeconfig --name nodejs-cluster --region ${AWS_REGION}
          kubectl apply -f k8s/deployment.yaml
          kubectl apply -f k8s/service.yaml
          kubectl set image deployment/nodejs-app nodejs-app=${ECR_REPO}:${IMAGE_TAG}
          kubectl rollout status deployment/nodejs-app
        """
      }
    }

    stage('Canary Deploy') {
      steps {
        sh """
          docker tag nodejs-app:${IMAGE_TAG} ${ECR_REPO}:canary
          docker push ${ECR_REPO}:canary
          kubectl apply -f k8s/canary-deployment.yaml
        """
      }
    }

  }

  post {
    success {
      echo 'Pipeline succeeded!'
    }
    failure {
      echo 'Pipeline failed!'
    }
  }
}
EOF