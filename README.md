# Langchain Chatbot with ReactJS Next Frontend and ExpressJS Backend.
MERN Based AI Chat Client with Integration with Free LLM API's. The chat client remembers who you are and who it is and it develops its personality and identity over time.

## Environment Variables

### Server (ExpressJS)

Requires the following environment variables in the `.env` file:
PORT=
OPEN_AI_KEY=
GOOGLE_API_KEY=

### Client (NextJS)

Requires the following environment variable in the `.env` file:
NEXT_PUBLIC_BACKEND_URL=

Note that `NEXT_PUBLIC_BACKEND_URL` is prefixed with `NEXT_PUBLIC_` to make it accessible on the client-side.

## Setup Process

### Step 1: Clone the repository

 Clone the repository using the following command:
```bash
git clone [https://github.com/your-repo-url.git](https://github.com/asarav/fullstack-ts-langchain)
```

### Step 2: Install dependencies
Install the dependencies for both the client and server using the following commands:
```bash
cd client
npm install
cd ../server
npm install
```

### Step 3: Create a .env file
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

### Step 6: Access the application
Open your web browser and navigate to http://localhost:3000 to access the application's UI.