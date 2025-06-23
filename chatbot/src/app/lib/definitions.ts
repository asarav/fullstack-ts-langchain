export interface ChatRequest {
  body: {
    message: string;
    conversationId: string;
  };
}