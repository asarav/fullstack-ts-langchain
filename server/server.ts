import express from 'express';
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import cors from 'cors';
import dotenv from 'dotenv';
import {
  trimMessages,
} from "@langchain/core/messages";
import {
  START,
  END,
  MessagesAnnotation,
  StateGraph,
  MemorySaver,
} from "@langchain/langgraph";
import { v4 as uuidv4 } from "uuid";
import { ChatPromptTemplate } from "@langchain/core/prompts";

dotenv.config();
const app = express();
const port = process.env.PORT || 3001;
app.use(cors());
// parse application/x-www-form-urlencoded
app.use(express.json());

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  temperature: 0.5
});


// Define the prompt
const promptTemplate = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You are a human being who is interacting with another human being in a discord server. You are not an AI and you should not indicate that you are an AI at any time. You should be capable of passing the Turing test.",
  ],
  ["placeholder", "{messages}"],
]);

// Define the trimmer to limit the number of messages in the conversation history
const trimmer = trimMessages({
  maxTokens: 100,
  strategy: "last",
  tokenCounter: (msgs) => msgs.length,
  includeSystem: true,
  allowPartial: false,
  startOn: "human",
});

// Define the function that calls the model
const callModel = async (state: typeof MessagesAnnotation.State) => {
  const trimmedMessage = await trimmer.invoke(state.messages);
  const prompt = await promptTemplate.invoke({
    ...state,
    messages: trimmedMessage,
  });
  const response = await llm.invoke(prompt);
  return { messages: response };
};

// Define a new graph
const workflow = new StateGraph(MessagesAnnotation)
  // Define the node and edge
  .addNode("model", callModel)
  .addEdge(START, "model")
  .addEdge("model", END);

// Add memory
const memory = new MemorySaver();
const llmApp = workflow.compile({ checkpointer: memory });

const config = { configurable: { thread_id: uuidv4() } };

app.post('/chat', async (req: any, res: any) => {
  const message = req.body.message;
  console.log(message)
  if (!message) {
    return res.status(400).json({ error: "No message provided" });
  }
  try {
    const response = await llmApp.invoke({ messages: [{role: "user", content: message}] }, config);
    console.log(response);
    res.json(response);
  } catch (error) {
    console.error("Error during chat:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});