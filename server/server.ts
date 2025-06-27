/**
 * Server entry point.
 *
 * This file sets up an Express server to handle incoming chat requests.
 * It uses the workflow defined in `workflow.ts` to process the requests.
 */

import { createServer, config } from "./serverConfig";
import { llmApp } from "./chain/workflow";
import { agent } from "./agent/agent";
import { getChatHistory, saveChatHistory } from "./db/chatHistory.service";
import connectDB from "./db/db";
import { HumanMessage } from "@langchain/core/messages";

/**
 * Create the Express server.
 *
 * This function creates a new Express server instance and configures it
 * with the necessary middleware and routes.
 */
const app = createServer();

//Global variables to store chat history and retrieve it
let chatHistory: any[] = [];
let chatHistoryUsed = false;
let agentHistory: any[] = [];

connectDB();

async function getChatHistoryObject(req: any, message: string) {
  if (!chatHistoryUsed) {
    const existingChatHistory = await getChatHistory(req.body.conversationId);
    if (existingChatHistory) {
      const messages = existingChatHistory.messages.map((message) => {
        if (message.content) {
          console.log(message);
          if (message.role === "user") {
            return { role: "user", content: message.content };
          } else {
            return { role: "assistant", content: message.content };
          }
        }
      });
      chatHistory = messages;
    }
    chatHistoryUsed = true;
    return { messages: [...chatHistory, new HumanMessage(message)] };
  } else {
    return { messages: [new HumanMessage(message)] };
  }
}

/**
 * Handle incoming chat requests.
 *
 * This function handles incoming POST requests to the `/chat` endpoint.
 * It expects a JSON body with a `message` property, which is passed to the
 * workflow for processing.
 */
app.post("/chat", async (req: any, res: any) => {
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

    const chatHistoryObject = await getChatHistoryObject(req, message);
    if (chatHistoryObject.messages && chatHistoryObject.messages.length > 1) {
      agentHistory = chatHistoryObject.messages;
    }
    console.log(agentHistory);

    // Invoke the workflow with the message
    const response = await llmApp.invoke(
      await getChatHistoryObject(req, message),
      config,
    );

    // Log the response from the workflow
    console.log("Response", response);

    // Save the chat history to MongoDB
    agentHistory = [...agentHistory, ...response.messages];
    await saveChatHistory(req.body.conversationId, [...agentHistory]);

    // Return the response to the client
    res.json(response);
  } catch (error) {
    // Log any errors that occur during processing
    console.error("Error during chat:", error);

    // Return a 500 error to the client
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/chat/history", async (req: any, res: any) => {
  try {
    // Get the conversation ID from the request query
    console.log("LOADING CHAT HISTORY", req?.query?.conversationId);
    const conversationId = req.query.conversationId;
    if (!conversationId) {
      console.log("Conversation ID is required");
      return res.status(400).json({ error: "Conversation ID is required" });
    }

    const response = await getChatHistory(conversationId);

    res.json(response?.messages);
  } catch (error) {
    console.error("Error loading chat history:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/agent", async (req: any, res: any) => {
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

    const chatHistoryObject = await getChatHistoryObject(req, message);
    if (chatHistoryObject.messages && chatHistoryObject.messages.length > 1) {
      agentHistory = chatHistoryObject.messages;
    }

    const response = await agent.stream(chatHistoryObject, {
      ...config,
      streamMode: "updates",
    });
    let responseMessages = [];
    for await (const step of response) {
      console.log(step);
      responseMessages.push(step);
    }

    // Save the chat history to MongoDB
    const toSave =
      responseMessages[responseMessages.length - 1]?.agent?.messages;
    if (toSave !== undefined && Array.isArray(toSave) && toSave.length > 0) {
      agentHistory = [...agentHistory, new HumanMessage(message), ...toSave];
      await saveChatHistory(req.body.conversationId, agentHistory);
    }

    res.json({
      messages: toSave,
    });
  } catch (error) {
    console.error("Error during chat:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Start the server.
 *
 * This function starts the Express server listening on the specified port.
 */
app.listen(app.get("port"), () => {
  // Log a message to indicate that the server is running
  console.log(`Server is running on port ${app.get("port")}`);
});
