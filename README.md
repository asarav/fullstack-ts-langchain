# Langchain Chatbot with ReactJS Next Frontend and ExpressJS Backend.
MERN Based AI Chat Client with Integration with Free LLM API's

This project is an AI-powered chat client that leverages the capabilities of free Large Language Model (LLM) APIs to provide a highly engaging and personalized conversational experience. The chat client is built using a MERN (MongoDB, Express, React, Node.js) stack and Langchain chains and agents.

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
- OPEN_AI_KEY=
- GOOGLE_API_KEY=

### Client (NextJS)

Requires the following environment variable in the `.env` file:
- NEXT_PUBLIC_BACKEND_URL=

Note that `NEXT_PUBLIC_BACKEND_URL` is prefixed with `NEXT_PUBLIC_` to make it accessible on the client-side.

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
- Dockerization with docker compose files to build and run the client, server, and mongodb in containers simultaneously with the proper environment values
- Manifest files for running containers within K8's locally (Windows)
- Introduction of vector stores for better storage of entities so that agents can build their identity over time and constrain themselves to that identity
- Adding summarization modules implemented in chain version to the agent version
- Updating chain prompt to include current date and time.
- Responsive UI
- Unit test suite for both server and client?
- General cleanup, cleaning up type annotations, and refactors
- Automated linting and prettifying
- Github runners/pipelines for running linting and unit tests