import express from 'express';
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import cors from 'cors';
import dotenv from 'dotenv';
import { MessageContent } from '@langchain/core/messages';

dotenv.config();
const app = express();
const port = process.env.PORT || 3001;
app.use(cors());
// parse application/x-www-form-urlencoded
app.use(express.json());

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  temperature: 0.5
});

const conversationHistory: { role: string; content: MessageContent; }[] = [];

app.post('/chat', async (req: any, res: any) => {
  const message = req.body.message;
  console.log(message)
  if (!message) {
    return res.status(400).json({ error: "No message provided" });
  }
  try {
    const conversation = conversationHistory.concat([{ role: "user", content: message }]);
    const response = await llm.invoke(conversation);
    conversationHistory.push(...conversation);
    conversationHistory.push({ role: "assistant", content: response.content });
    res.json(response);
  } catch (error) {
    console.error("Error during chat:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});