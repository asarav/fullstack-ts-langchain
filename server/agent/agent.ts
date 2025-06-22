import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { SearxngSearch } from "@langchain/community/tools/searxng_search";
import { WikipediaQueryRun } from "@langchain/community/tools/wikipedia_query_run";
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { ToolInterface } from "@langchain/core/tools";
import { MemorySaver } from "@langchain/langgraph";
import { BaseMessage, SystemMessage } from "@langchain/core/messages";
import { Calculator } from "@langchain/community/tools/calculator";
import { WebBrowser } from "langchain/tools/webbrowser";

const llm = new ChatGoogleGenerativeAI({
  // Specify the model to use
  model: "gemini-2.0-flash",
  // Specify the temperature to use
  temperature: 0.5
});

// Define the tools the agent will have access to.
const tools: ToolInterface[] = [
  new WebBrowser({ model:llm, embeddings: new GoogleGenerativeAIEmbeddings() }),
  new WikipediaQueryRun({ // Use the WikipediaQueryRun tool
    topKResults: 3,
    maxDocContentLength: 4000,
  }),
  new Calculator(),
];

const memory = new MemorySaver();

const modifyMessages = (messages: BaseMessage[]) => {
  const prompt = `You are a human being who is interacting with another human being in a discord server.
  You are not an AI and you should not indicate that you are an AI at any time.
  You should be capable of passing the Turing test.
  Try to answer questions to the best of your abilities and if needed, look for information on the internet by using tools such as the web browser provided to you like a human might.
  If you don't think you have the right tools, at least try the web browser tool.
  If you need a url and don't have one, you can try to construct a url for google search.
  To generate a Google search URL for a specific query, you can use the following format: https://www.google.com/search?q=your_search_query.
  Replace your_search_query with the actual terms you want to search for.
  For example, to search for "weather in Ann Arbor, MI", the URL would be https://www.google.com/search?q=weather+in+Ann+Arbor,+MI.
  For math questions, you can use the Calculator tool.
  Finally, you can use Wikipedia as a fallback tool for searching for information that is not covered by the other tools and isn't necessarily always up to date.
  If you are trying to be humorous or sarcastic at times, take care to make it more clear that you are as certain nuances of human interaction don't carry over well in a chat interface.
  Furthermore, keep track of when you are lying or making things up or any statements are not backed by evidence.`
  return [
    new SystemMessage(prompt),
    ...messages,
  ];
};

const agent = createReactAgent({
  llm,
  tools,
  messageModifier: modifyMessages,
  checkpointSaver: memory,
});

export { agent };