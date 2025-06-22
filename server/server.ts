/**
 * Server entry point.
 * 
 * This file sets up an Express server to handle incoming chat requests.
 * It uses the workflow defined in `workflow.ts` to process the requests.
 */

import { createServer, config } from './serverConfig';
import { llmApp } from './chain/workflow';
import { agent } from './agent/agent';
import { getChatHistory, saveChatHistory } from './db/chatHistory.service';
import connectDB from './db/db';


/**
 * Create the Express server.
 * 
 * This function creates a new Express server instance and configures it
 * with the necessary middleware and routes.
 */
const app = createServer();

//Global variables to store chat history and retrieve it
let chatHistory: any[] = []
let chatHistoryUsed = false

connectDB();

/**
 * Handle incoming chat requests.
 * 
 * This function handles incoming POST requests to the `/chat` endpoint.
 * It expects a JSON body with a `message` property, which is passed to the
 * workflow for processing.
 */
app.post('/chat', async (req: any, res: any) => {
  // Get the message from the request body
  const message = req.body.message;

  // Check if the message is empty
  if (!message) {
    // Return a 400 error if the message is empty
    console.log("No message provided");
    return res.status(400).json({ error: "No message provided" });
  }

  try {
    // Log the incoming message
    console.log("Message", message);

    // Invoke the workflow with the message
    let response;
    if(!chatHistoryUsed){
      const existingChatHistory = await getChatHistory(req.body.conversationId);
      if (existingChatHistory) {
        const messages = existingChatHistory.messages.map((message) => {
          if (message.role === "user") {
            return { role: "user", content: message.content };
          } else {
            return { role: "assistant", content: message.content };
          }
        });
        chatHistory = messages;
      }
      chatHistoryUsed = true
      response = await llmApp.invoke({ messages: [...chatHistory, {role: "user", content: message}] }, config);
    } else {
      response = await llmApp.invoke({ messages: [{role: "user", content: message}] }, config);
    }

    // Log the response from the workflow
    console.log("Response", response);

    // Save the chat history to MongoDB
    await saveChatHistory(req.body.conversationId, response.messages);

    // Return the response to the client
    res.json(response);
  } catch (error) {
    // Log any errors that occur during processing
    console.error("Error during chat:", error);

    // Return a 500 error to the client
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get('/chat/history', async (req: any, res: any) => {
  try {
    // Get the conversation ID from the request query
    console.log("LOADING CHAT HISTORY", req?.query?.conversationId);
    const conversationId = req.query.conversationId;
    if (!conversationId) {
      console.log("Conversation ID is required");
      return res.status(400).json({ error: "Conversation ID is required" });
    }

    const chatHistory = await getChatHistory(conversationId);
    
    res.json(chatHistory?.messages);
  } catch (error) {
    console.error("Error loading chat history:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post('/agent', async (req: any, res: any) => {
  // Get the message from the request body
  const message = req.body.message;

  // Check if the message is empty
  if (!message) {
    // Return a 400 error if the message is empty
    console.log("No message provided");
    return res.status(400).json({ error: "No message provided" });
  }

  try {
    // Log the incoming message
    console.log("Message", message);
    
    const response = await agent.stream(
      { messages: [{role: "user", content: message}] },
      { ...config, streamMode: "updates" }
    );
    let responseMessages = [];
    for await (const step of response) {
      console.log(step);
      responseMessages.push(step);
    }
    res.json({ messages: responseMessages[responseMessages.length - 1]?.agent?.messages });
  } catch (error) {
    console.error("Error during chat:", error);
    res.status(500).json({ error: "Internal server error" });
  }
})

/**
 * Start the server.
 * 
 * This function starts the Express server listening on the specified port.
 */
app.listen(app.get('port'), () => {
  // Log a message to indicate that the server is running
  console.log(`Server is running on port ${app.get('port')}`);
});