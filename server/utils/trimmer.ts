import { trimMessages } from "@langchain/core/messages";

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

export default trimmer;
