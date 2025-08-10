# Langchain Chatbot with ReactJS Next Frontend and ExpressJS Backend.
MERN Based AI Chat Client with Integration with Free LLM API's

This project is an AI-powered chat client that leverages the capabilities of free Large Language Model (LLM) APIs to provide a highly engaging and personalized conversational experience. The chat client is built using a MERN (MongoDB, Express, React, Node.js) stack and Langchain chains and agents.

## Table of Contents
- [Key Features](#key-features)
- [Current Functionality](#current-functionality)
- [Technical Details](#technical-details)
- [Environment Variables](#environment-variables)
- [Setup Process](#setup-process)
- [Running with Docker Compose](#running-with-docker-compose)
- [Running with Kubernetes & Minikube (Windows)](#running-with-kubernetes--minikube-windows)
- [Automation Script](#automation-script)
- [Troubleshooting](#troubleshooting)
- [Cleanup](#cleanup)

## Key Features:

-  Personalized Conversations: The chat client remembers user interactions and develops a unique personality and identity over time, allowing for a more human-like conversation experience.
- Integration with Free LLM APIs: The chat client seamlessly integrates with free LLM APIs, enabling it to generate highly accurate and context-specific responses to user queries.
- Contextual Understanding: The chat client uses advanced NLP techniques to understand the context of user input, enabling it to provide more relevant and accurate responses.
- User Memory: The chat client remembers user interactions and can recall them in future conversations, allowing for a more personalized and engaging experience.
- The Agent version is able to understand what information is current and what information is not when retrieving information from the internet or tools.

## Current Functionality:

- Users can interact with the chat client using natural language, and the chat client responds accordingly.
- The chat client can understand and respond to a wide range of user queries, including but not limited to:
- General knowledge questions
- Conversational dialogue
- Emotional support and empathy
- The chat client can develop its personality and identity over time, based on user interactions.
- The chat client can recall user interactions and use them to inform future conversations.
- Switching between chain and agent versions of the chatbot where the agent version is able to make requests to the internet through tool usage.

## Technical Details:

- The chat client is built using a MERN stack, with a ReactJS Next frontend and an ExpressJS backend.
- It is fully in Typescript
- The chat client uses free LLM APIs to generate responses to user queries.
- The chat client uses MongoDB to store user interactions and conversation history outside of memory for continued sessions.

## Environment Variables

### Server (ExpressJS)

Requires the following environment variables in the `.env` file:
- PORT=
- MONGODB_URI=
- MONGODB_PORT=
- MONGODB_COLLECTION=
- OPEN_AI_KEY=
- GOOGLE_API_KEY=

### Client (NextJS)

Requires the following environment variable in the `.env` file:
- NEXT_PUBLIC_BACKEND_URL=

Note that `NEXT_PUBLIC_BACKEND_URL` is prefixed with `NEXT_PUBLIC_` to make it accessible on the client-side.

> **Note:** For Kubernetes, environment variables are set directly in the deployment YAMLs. For production, you should use [Kubernetes Secrets](https://kubernetes.io/docs/concepts/configuration/secret/) to store sensitive values like API keys, and reference them in your deployment manifests.

## Setup Process

### Step 1: Clone the repository

 Clone the repository using the following command:
```bash
git clone [https://github.com/your-repo-url.git](https://github.com/asarav/fullstack-ts-langchain)
```

### Step 2: Install dependencies
Install the dependencies for both the client and server using the following commands starting at the root:
```bash
npm install
cd client
npm install
cd ../server
npm install
```

### Step 3: Create .env files
Create a new file named .env in the root of both the client and server directories.
Add the required environment variables to the file.

### Step 4: Start the server
Start the server using the following command:
```bash
cd server
npm start
```

### Step 5: Start the client
Start the client using the following command:
```bash
cd client
npm run dev
```

Note: It is also possible to run both concurrently with one command by running the following at the root of the project:
```bash
npm start
```

### Step 6: Access the application
Open your web browser and navigate to http://localhost:3000 to access the application's UI.

### TODOS:
- Introduction of vector stores for better storage of entities so that agents can build their identity over time and constrain themselves to that identity
- Updating chain prompt to include current date and time.
- Responsive UI
- Unit test suite for both server and client?
- General cleanup, cleaning up type annotations, and refactors
- Automated linting and prettifying
- Github runners/pipelines for running linting and unit tests
- Further split Express app into routes and controllers

To run on docker use the docker compose.

## Running with Docker Compose

```bash
docker compose --env-file ./server/.env --env-file ./chatbot/.env up
```

## Running with Kubernetes & Minikube (Windows)

These steps will get the fullstack chatbot (MongoDB, Express backend, and Next.js frontend) running locally using Kubernetes and Minikube.

> **Note:** The frontend uses a Next.js proxy to communicate with the backend. All API calls are made to `/api/...` and are automatically forwarded to the backend service inside the cluster. No NodePort or Minikube IP patching is needed.

### Prerequisites

- **Docker Desktop** (must be running)
- **Minikube** ([Install guide](https://minikube.sigs.k8s.io/docs/start/))
- **kubectl** ([Install guide](https://kubernetes.io/docs/tasks/tools/))
- **Windows PowerShell** (recommended for command compatibility)

### 1. Start Minikube

Open PowerShell and run:
```powershell
minikube start --driver=docker
```
Wait until Minikube is fully started.

### 2. Set Docker to use Minikube's Docker Daemon

This ensures images you build are available to Kubernetes:
```powershell
& minikube -p minikube docker-env | Invoke-Expression
```

### 3. Build Docker Images for Backend and Frontend

From your project root:
```powershell
docker build -t server:latest ./server
docker build -t chatbot:latest ./chatbot
```

### 4. Create the Kubernetes Namespace

```powershell
kubectl apply -f k8s/namespace.yml
```

### 5. Set Up Configuration and Secrets

**Option A: Use the provided Secret template (for development)**
```powershell
# Edit k8s/secret.yml and replace the placeholder values with your base64-encoded API keys
# To encode your API key: [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes("your-api-key"))
kubectl apply -f k8s/secret.yml
```

**Option B: Create Secret directly (recommended)**
```powershell
kubectl create secret generic chatbot-secrets --from-literal=OPEN_AI_KEY="your-openai-key" --from-literal=GOOGLE_API_KEY="your-google-api-key" -n chatbot-app
```

### 6. Apply ConfigMap

```powershell
kubectl apply -f k8s/configmap.yml
```

### 7. Deploy MongoDB

```powershell
kubectl apply -f k8s/mongo/ -n chatbot-app
```

Wait until the MongoDB pod is running:
```powershell
kubectl get pods -n chatbot-app
```
You should see `mongo-...   1/1   Running`.

### 8. Deploy the Backend (Express Server)

```powershell
kubectl apply -f k8s/server/ -n chatbot-app
```

### 9. Deploy the Frontend (Next.js)

```powershell
kubectl apply -f k8s/chatbot/ -n chatbot-app
```

### 10. Access the Application

Expose the frontend service and open it in your browser:
```powershell
minikube service chatbot -n chatbot-app
```
This will print a URL (e.g. `http://127.0.0.1:32000`)—open it in your browser.

---

**Notes:**
- The frontend uses a Next.js proxy (`/api`) to communicate with the backend, so you do not need to set or patch any backend URL or NodePort.
- MongoDB URI is automatically assembled from ConfigMap values: `mongodb://mongo:27017/chatbot-db`
- If you change the code, rebuild the Docker images and restart the deployments.
- If you see `ImagePullBackOff` or `ErrImagePull`, make sure you built the images after switching Docker to Minikube's environment and that `imagePullPolicy: Never` is set in the deployments.
- You can check logs with:
  ```powershell
  kubectl logs -n chatbot-app deployment/server
  kubectl logs -n chatbot-app deployment/chatbot
  ```

## Automation Script

You can automate all the Kubernetes setup steps with the provided PowerShell script:

```powershell
.\run-k8s.ps1
```

This script will:
- Start Minikube
- Switch Docker to Minikube's environment
- Build both images
- Apply all manifests in the correct order
- Wait for MongoDB to be ready before deploying the backend
- Open the frontend in your browser

> **Tip:** Open PowerShell as Administrator for best results.

### Cleanup Script

To completely clean up all Kubernetes resources and stop Minikube:

```powershell
.\cleanup-k8s.ps1
```

This script will:
- Delete all resources from the chatbot-app namespace
- Remove ConfigMaps and Secrets
- Delete PersistentVolumeClaims
- Remove the entire namespace
- Stop and delete the Minikube cluster

> **Note:** This will permanently delete all data and configurations. Use this when you want to start completely fresh.

## Troubleshooting

- **Minikube fails to start:**  
  Make sure Docker Desktop is running and you have enough resources (CPU, RAM) allocated.
- **ImagePullBackOff or ErrImagePull:**  
  Ensure you built the images after switching Docker to Minikube's environment and that `imagePullPolicy: Never` is set in the deployment YAMLs.
- **MongoDB connection errors:**  
  Make sure the MongoDB pod is running before deploying the backend. Check that all environment variables (MONGODB_URI, MONGODB_PORT, MONGODB_COLLECTION) are properly set in the ConfigMap.
- **API key errors (500 Internal Server Error):**  
  Ensure your API keys are valid and properly set in the Kubernetes secrets. Check server logs for specific error messages.
- **Port already in use:**  
  If you get a port conflict, change the `nodePort` in `k8s/chatbot/service.yml` to an available port.

For more help, check the logs:
```powershell
kubectl logs -n chatbot-app deployment/server
kubectl logs -n chatbot-app deployment/chatbot
```

## Cleanup

To stop and delete all Minikube resources:
```powershell
minikube stop
minikube delete
```