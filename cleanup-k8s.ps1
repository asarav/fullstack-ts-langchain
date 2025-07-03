# cleanup-k8s.ps1
# Script to clean up fullstack chatbot deployment from Minikube (Windows)

Write-Host "Starting Kubernetes cleanup..." -ForegroundColor Yellow

Write-Host "Deleting all resources from chatbot-app namespace..." -ForegroundColor Green
kubectl delete all --all -n chatbot-app

Write-Host "Deleting ConfigMap and Secret..." -ForegroundColor Green
kubectl delete configmap chatbot-config -n chatbot-app --ignore-not-found=true
kubectl delete secret chatbot-secrets -n chatbot-app --ignore-not-found=true

Write-Host "Deleting PersistentVolumeClaim..." -ForegroundColor Green
kubectl delete pvc mongo-pvc -n chatbot-app --ignore-not-found=true

Write-Host "Deleting chatbot-app namespace..." -ForegroundColor Green
kubectl delete namespace chatbot-app --ignore-not-found=true

Write-Host "Stopping Minikube..." -ForegroundColor Green
minikube stop

Write-Host "Deleting Minikube cluster..." -ForegroundColor Green
minikube delete

Write-Host "Cleanup complete! All Kubernetes resources have been removed." -ForegroundColor Green
Write-Host "To start fresh, run: .\run-k8s.ps1" -ForegroundColor Cyan 