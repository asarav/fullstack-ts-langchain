// api.ts
import { ChatRequest } from "@/app/lib/definitions";
import axios from "axios";

const api = axios.create({
  baseURL: "/api", // Using Next.js proxy to backend service
});

export const generateChatResponse = async (req: ChatRequest) => {
  try {
    const message = req.body.message;
    const conversationId = req.body.conversationId;
    const response = await api.post("/chat", { message, conversationId });
    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const fetchChatHistory = async (conversationId: string) => {
  try {
    const response = await api.get(
      `chat/history?conversationId=${conversationId}`,
    );
    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const generateAgentResponse = async (req: ChatRequest) => {
  try {
    const message = req.body.message;
    const conversationId = req.body.conversationId;
    const response = await api.post("/agent", { message, conversationId });
    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
