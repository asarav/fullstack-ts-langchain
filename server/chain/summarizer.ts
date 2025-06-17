import { HumanMessage } from "@langchain/core/messages";
import { GraphAnnotation } from "./graphAnnotation";
import { v4 as uuidv4 } from "uuid";
import { llm } from "./callModel";

const summarizeConversation = async (state: typeof GraphAnnotation.State): Promise<Partial<typeof GraphAnnotation.State>> => {
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
};

export { summarizeConversation };