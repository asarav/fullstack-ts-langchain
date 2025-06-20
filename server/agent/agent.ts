import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { VertexAIEmbeddings } from "@langchain/google-vertexai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
// Note: tslab only works inside a jupyter notebook. Don't worry about running this code yourself!
import * as tslab from "tslab";

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  temperature: 0
});


const embeddings = new VertexAIEmbeddings({
  model: "text-embedding-004"
});

const vectorStore = new MemoryVectorStore(embeddings);


const agent = createReactAgent({ llm: llm, tools: [retrieve] });

const image = await agent.getGraph().drawMermaidPng();
const arrayBuffer = await image.arrayBuffer();

await tslab.display.png(new Uint8Array(arrayBuffer));

let inputMessage = `What is the standard method for Task Decomposition?
Once you get the answer, look up common extensions of that method.`;

let inputs5 = { messages: [{ role: "user", content: inputMessage }] };

for await (const step of await agent.stream(inputs5, {
  streamMode: "values",
})) {
  const lastMessage = step.messages[step.messages.length - 1];
  prettyPrint(lastMessage);
  console.log("-----\n");
}