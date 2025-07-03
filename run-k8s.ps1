# run-k8s.ps1
# Script to automate fullstack chatbot deployment on Minikube (Windows)
# Uses Next.js proxy for backend communication (no NodePort/IP patching needed)

Write-Host "Starting Minikube with Docker driver..." -ForegroundColor Green
minikube start --driver=docker

Write-Host "Switching Docker to use Minikube's Docker daemon..." -ForegroundColor Green
& minikube -p minikube docker-env | Invoke-Expression

Write-Host "Building backend Docker image..." -ForegroundColor Green
docker build -t server:latest ./server

Write-Host "Building frontend Docker image..." -ForegroundColor Green
docker build -t chatbot:latest ./chatbot

Write-Host "Creating Kubernetes namespace..." -ForegroundColor Green
kubectl apply -f k8s/namespace.yml

Write-Host "Applying ConfigMap and Secret..." -ForegroundColor Green
kubectl apply -f k8s/configmap.yml
kubectl apply -f k8s/secret.yml

Write-Host "Deploying MongoDB..." -ForegroundColor Green
kubectl apply -f k8s/mongo/ -n chatbot-app

Write-Host "Waiting for MongoDB pod to be ready..." -ForegroundColor Yellow
do {
    Start-Sleep -Seconds 2
    $mongoStatus = kubectl get pods -n chatbot-app -l app=mongo -o jsonpath="{.items[0].status.phase}"
    Write-Host "MongoDB pod status: $mongoStatus"
} while ($mongoStatus -ne "Running")

Write-Host "MongoDB is ready! Deploying backend (Express server)..." -ForegroundColor Green
kubectl apply -f k8s/server/ -n chatbot-app

Write-Host "Deploying frontend (Next.js)..." -ForegroundColor Green
kubectl apply -f k8s/chatbot/ -n chatbot-app

Write-Host "Waiting for all pods to be ready..." -ForegroundColor Yellow
do {
    Start-Sleep -Seconds 3
    $serverStatus = kubectl get pods -n chatbot-app -l app=server -o jsonpath="{.items[0].status.phase}"
    $chatbotStatus = kubectl get pods -n chatbot-app -l app=chatbot -o jsonpath="{.items[0].status.phase}"
    Write-Host "Server pod status: $serverStatus, Chatbot pod status: $chatbotStatus"
} while ($serverStatus -ne "Running" -or $chatbotStatus -ne "Running")

Write-Host "All resources applied successfully! Opening frontend in browser..." -ForegroundColor Green
minikube service chatbot -n chatbot-app

Write-Host "Checking server logs for successful startup..." -ForegroundColor Cyan
Start-Sleep -Seconds 5
kubectl logs -n chatbot-app deployment/server

Write-Host "Checking chatbot logs..." -ForegroundColor Cyan
kubectl logs -n chatbot-app deployment/chatbot

Write-Host "Deployment complete! The application should be accessible via the URL above." -ForegroundColor Green
Write-Host "If you encounter any issues, check the logs above or run:" -ForegroundColor Yellow
Write-Host "kubectl logs -n chatbot-app deployment/server" -ForegroundColor Gray
Write-Host "kubectl logs -n chatbot-app deployment/chatbot" -ForegroundColor Gray
