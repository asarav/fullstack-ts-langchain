/**
 * Model caller.
 *
 * This file defines a function that calls the language model to generate a response.
 * It uses the `ChatGoogleGenerativeAI` class from `@langchain/google-genai` to interact with the model.
 */

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { promptTemplate } from "./promptTemplate";
import { GraphAnnotation } from "./graphAnnotation";
import { trimMessages } from "@langchain/core/messages";

/**
 * Create a new language model instance.
 *
 * This function creates a new instance of the `ChatGoogleGenerativeAI` class,
 * which is used to interact with the language model.
 */
const llm = new ChatGoogleGenerativeAI({
  // Specify the model to use
  model: "gemini-2.0-flash",
  // Specify the temperature to use
  temperature: 0.5,
});

/**
 * Create a message trimmer.
 *
 * This function creates a new instance of the `trimMessages` class,
 * which is used to trim the conversation history.
 */
const trimmer = trimMessages({
  // Specify the maximum number of tokens to keep
  maxTokens: 1000,
  // Specify the strategy to use for trimming
  strategy: "last",
  // Specify the token counter function
  tokenCounter: (msgs) => msgs.length,
  // Specify whether to include system messages
  includeSystem: true,
  // Specify whether to allow partial messages
  allowPartial: false,
  // Specify the starting point for trimming
  startOn: "human",
});

/**
 * Call the language model.
 *
 * This function calls the language model to generate a response to the given input.
 * It uses the `promptTemplate` to generate a prompt for the model, and then invokes the model with the prompt.
 */
const callModel = async (state: typeof GraphAnnotation.State) => {
  // If a summary exists, we add this in as a system message
  const { summary } = state;
  let { messages } = state;

  // Trim the messages prior to passing to the model
  const trimmedMessage = await trimmer.invoke(messages);
  console.log("TRIMMING");
  console.log(messages.length, trimmedMessage.length);

  // Generate a prompt for the model using the prompt template
  const prompt = await promptTemplate.invoke({
    summary: summary,
    messages: trimmedMessage,
  });

  // Call the model with the prompt
  const response = await llm.invoke(prompt);

  // Return the response from the model
  return { summary: summary, messages: response };
};

export { callModel, llm, trimmer };
