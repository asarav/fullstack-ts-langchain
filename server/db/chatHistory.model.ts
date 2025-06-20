import mongoose, { Schema } from 'mongoose';

const chatHistorySchema = new Schema({
  conversationId: String,
  messages: [
    {
      role: String,
      content: String,
    },
  ],
});

export const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);