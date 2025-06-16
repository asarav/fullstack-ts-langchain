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
  Annotation
} from "@langchain/langgraph";
import { v4 as uuidv4 } from "uuid";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { HumanMessage } from "@langchain/core/messages";

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
    "You are a human being who is interacting with another human being in a discord server. You are not an AI and you should not indicate that you are an AI at any time. You should be capable of passing the Turing test. Try to answer questions to the best of your abilities. If you are trying to be humorous or sarcastic at times, take care to make it more clear that you are as certain nuances of human interaction don't carry over well in a chat interface. {summary}",
  ],
  ["placeholder", "{messages}"],
]);

// Define the trimmer to limit the number of messages in the conversation history
const trimmer = trimMessages({
  maxTokens: 1000,
  strategy: "last",
  tokenCounter: (msgs) => msgs.length,
  includeSystem: true,
  allowPartial: false,
  startOn: "human",
});

// We will add a `summary` attribute (in addition to `messages` key,
// which MessagesAnnotation already has)
const GraphAnnotation = Annotation.Root({
  ...MessagesAnnotation.spec,
  summary: Annotation<string>({
    reducer: (_, action) => action,
    default: () => "",
  })
});


/**
 * Given the current state of the conversation, this function trims the messages
 * using the trimmer, generates a prompt using the prompt template, and calls
 * the model. The model's response is then added to the messages and returned.
 * @param state the current state of the conversation
 * @returns a partial state with the updated summary and messages
 */
const callModel = async (state: typeof GraphAnnotation.State) => {
  // If a summary exists, we add this in as a system message
  const { summary } = state;
  let { messages } = state;
  // Trim the messages prior to passing to the model
  const trimmedMessage = await trimmer.invoke(messages);
  console.log("TRIMMING");
  console.log(messages.length, trimmedMessage.length);
  const prompt = await promptTemplate.invoke({
      summary: summary,
      messages: trimmedMessage,
    });
  

  // Call the model
  const response = await llm.invoke(prompt);
  return { summary: summary, messages: response };
};

/**
 * This function takes the current state of the conversation and creates a summary of
 * it. If a summary already exists, the new messages are added to the existing summary.
 * If not, a new summary is created. The summary is then inserted into the messages
 * list as a new system message. The response from the model is then used to update
 * the summary and messages in the state.
 * @param state the current state of the conversation
 * @returns a partial state with the updated summary and messages
 */
async function summarizeConversation(state: typeof GraphAnnotation.State): Promise<Partial<typeof GraphAnnotation.State>> {
  // First, we summarize the conversation
  const { summary, messages } = state;
  let summaryMessage: string;
  if (summary) {
    // If a summary already exists, we use a different system prompt
    // to summarize it than if one didn't
    summaryMessage = `This is summary of the conversation to date: ${summary}\n\n` +
      "Extend or continue the summary by taking into account the new messages above. Be precise with your wording such that the most important information is contained without the need for anything extraneous. Keep track of who is doing what, and who you are in the conversation. As new information comes up, make sure to associate that information with either yourself or the right person depending on who that information is associated to.";
  } else {
    summaryMessage = "Create a summary of the conversation above:";
  }

  const allMessages = [...messages, new HumanMessage({
    id: uuidv4(),
    content: summaryMessage,
  })];
  const response = await llm.invoke(allMessages);
  if (typeof response.content !== "string") {
    throw new Error("Expected a string response from the model");
  }
  return { summary: response.content, messages: messages };
}

// Define a new graph
const workflow = new StateGraph(GraphAnnotation)
  // Define the node and edge
  .addNode("model", callModel)
  .addNode("summarize_conversation", summarizeConversation)
  .addEdge(START, "summarize_conversation")
  .addEdge("summarize_conversation", "model")
  .addEdge("model", END);

// Add memory
const memory = new MemorySaver();
const llmApp = workflow.compile({ checkpointer: memory });

const config = { configurable: { thread_id: uuidv4() } };

app.post('/chat', async (req: any, res: any) => {
  const message = req.body.message;
  if (!message) {
    return res.status(400).json({ error: "No message provided" });
  }
  try {
    console.log(message)
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