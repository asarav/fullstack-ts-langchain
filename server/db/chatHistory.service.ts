import { HumanMessage } from "@langchain/core/messages";
import { ChatHistory } from "./chatHistory.model";

const saveChatHistory = async (conversationId: string, messages: any[]) => {
  try {
    console.log("Saving chat history");
    const messagesWithRoles = messages.map((message, index) => {
      console.log(message);
      if (message instanceof HumanMessage) {
        return { role: "user", content: message?.content };
      } else {
        return { role: "assistant", content: message?.content };
      }
    });

    await ChatHistory.updateOne(
      { conversationId },
      { $set: { messages: messagesWithRoles } },
      { upsert: true },
    );
  } catch (error) {
    console.error("Error saving chat history:", error);
  }
};

const getChatHistory = async (conversationId: string) => {
  const chatHistory = await ChatHistory.findOne({ conversationId });
  return chatHistory;
};

export { saveChatHistory, getChatHistory };
