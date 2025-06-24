import { StateGraph, MemorySaver, START, END } from "@langchain/langgraph";
import { GraphAnnotation } from "./graphAnnotation";
import { callModel } from "./callModel";
import { summarizeConversation } from "../utils/summarizer";

// Define a new graph
const workflow = new StateGraph(GraphAnnotation)
  // Define the node and edge
  .addNode("model", callModel)
  .addNode("summarize_conversation", summarizeConversation)
  .addEdge(START, "summarize_conversation")
  .addEdge("summarize_conversation", "model")
  .addEdge("model", END);

const memory = new MemorySaver();
const llmApp = workflow.compile({ checkpointer: memory });

export { llmApp, workflow, memory };
