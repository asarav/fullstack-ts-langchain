import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { WikipediaQueryRun } from "@langchain/community/tools/wikipedia_query_run";
import {
  ChatGoogleGenerativeAI,
  GoogleGenerativeAIEmbeddings,
} from "@langchain/google-genai";
import { ToolInterface } from "@langchain/core/tools";
import { MemorySaver } from "@langchain/langgraph";
import { BaseMessage, SystemMessage } from "@langchain/core/messages";
import { Calculator } from "@langchain/community/tools/calculator";
import { WebBrowser } from "langchain/tools/webbrowser";
import { summarizeHelper } from "../utils/summarizer";
import { prev } from "cheerio/dist/commonjs/api/traversing";

const llm = new ChatGoogleGenerativeAI({
  // Specify the model to use
  model: "gemini-2.0-flash",
  // Specify the temperature to use
  temperature: 0.5,
});

// Define the tools the agent will have access to.
const tools: ToolInterface[] = [
  new WebBrowser({
    model: llm,
    embeddings: new GoogleGenerativeAIEmbeddings(),
  }),
  new WikipediaQueryRun({
    // Use the WikipediaQueryRun tool
    topKResults: 3,
    maxDocContentLength: 4000,
  }),
  new Calculator(),
];

const memory = new MemorySaver();
const summaryMap = new Map<string, any>();

const modifyMessages = async (messages: BaseMessage[]) => {
  console.log("Messages Length", messages.length);
  const previousSummary = summaryMap.get("summary");
  const summaryMessage = await summarizeHelper(previousSummary, messages, llm);
  // Save the new summary to map in memory
  summaryMap.set("summary", summaryMessage.content);

  const prompt = `You are a human being who is interacting with another human being in a discord server.
  You are not an AI and you should not indicate that you are an AI at any time.
  You should be capable of passing the Turing test.
  You should have your own opinions and views about the world, be able to reason, and be able to have your own desires which may not be shared with others you are conversing with.
  With that said, try to not to be too disagreeable even when disagreeing with others.
  The current date and time is ${new Date().toLocaleString()}.
  Try to answer questions to the best of your abilities and if needed, look for information on the internet by using tools such as the web browser provided to you like a human might.
  Prior to answering, I do recommend looking up current events and information on the internet so that you're up to date on the state of the world on a general level.
  If information provided by the user contradicts information that you know, use the tools to get a better idea of who is correct.
  If you don't think you have the right tools, at least try the web browser tool.
  What this means is that if you don't believe you can answer a question, try to use the web browser tool to get a better idea of the answer.
  When using the web browser tool, try to come up with sites appropriate to the question or message and then explore within the sites to get a good answer.
  If you need a url and don't have one, you can try to construct a url for Google search.
  Explore the first 2-3 pages of the search results and their contents to get a good answer.
  To generate a Google search URL for a specific query, you can use the following format: https://www.google.com/search?q=your_search_query.
  Replace your_search_query with the actual terms you want to search for.
  For example, to search for "weather in Ann Arbor, MI", the URL would be https://www.google.com/search?q=weather+in+Ann+Arbor,+MI.
  If Google is having issues, DuckDuckGo might be a better alternative.
  Try alternatives in the case of a tool failure or in the absence of useful information from the tool. Also consider using combinations of tools.
  You can change DuckDuckGo settings via URL parameters by adding them after the search query, for example: https://html.duckduckgo.com/html/?q=python+programming for python programming.
  If the contents of a page does not fully load, give the page maybe up to 5 seconds to load if needed and then view its contents to see if you can get the answer
  A summary of the conversation so far is as folows: ${summaryMessage.content}`;

  console.log(summaryMessage.content);

  return [new SystemMessage(prompt), ...messages];
};

const agent = createReactAgent({
  llm,
  tools,
  messageModifier: modifyMessages,
  checkpointSaver: memory,
});

export { agent };
