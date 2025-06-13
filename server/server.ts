import express from 'express';
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const port = process.env.PORT || 3001;
app.use(cors());
// parse application/x-www-form-urlencoded
app.use(express.json());


const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  temperature: 0
});

//TODO: Refactor the types here
app.post('/chat', async (req: { body: { message: string; }; }, res: any) => {
  const message = req.body.message;
  if (!message) {
    return res.status(400).json({ error: "No message provided" });
  }
  try {
      const response = await llm.invoke([{ role: "user", content: message }]);
      res.json(response);
  } catch (error) {
      console.error("Error during chat:", error);
      res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});