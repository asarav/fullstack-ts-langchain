"use client";

import { useState, useRef } from "react";
import axios from "axios";

interface ChatLogEntry {
  message: string;
  response: string;
  timestamp: string;
}

export default function Home() {
  const [chatLog, setChatLog] = useState<ChatLogEntry[]>([]);
  const [message, setMessage] = useState<string>("");
  const [isSending, setIsSending] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  console.log("CHAT LOG!");
  console.log(chatLog);

  // Handle sending a message to the chat API
  const handleSendMessage = async () => {
    // Prevent sending messages if the user is already sending a message or if the message is empty
    if (isSending || message.trim() === "") return;

    // Set the sending state to true to prevent multiple messages from being sent at once
    setIsSending(true);

    // Get the current timestamp for the message
    const timestamp = new Date().toLocaleTimeString();

    // Add the user's message to the chat log with an empty response
    setChatLog((prevLog) => [...prevLog, { message, timestamp, response: "" }]);

    setMessage("");

    try {
      // Send the message to the chat API
      const response = await axios.post("http://localhost:3001/chat", { message });

      // Log the response from the API
      console.log("RESPONSE");
      console.log(response.data);

      // Get the response text from the API
      const responseText = response.data?.kwargs?.content;
      textAreaRef.current?.focus();

      // Create a variable to build the response
      // Split the response into words
      const responseWords = responseText.split(" ");

      // Create a variable to build the response
      let responseBuilder = "";

      // Create an interval to simulate the AI typing out the response
      const intervalId = setInterval(() => {
        // Get the next word in the response
        const nextWord = responseWords.shift();

        // If the next word is not undefined, update the chat log
        if (nextWord !== undefined) {
          responseBuilder += nextWord + " ";

          setChatLog((prevLog) => {
            const newLog = [...prevLog];
            if (newLog.length > 0) {
              newLog[newLog.length - 1].response = responseBuilder;
            } else {
              newLog.push({ message: "", response: responseBuilder, timestamp: timestamp });
            }
            return newLog;
          });
        }

        // If there are no more words in the response, clear the interval and reset the sending state
        if (responseWords.length === 0) {
          clearInterval(intervalId);
          setIsSending(false);
          textAreaRef.current?.focus();
        }
      }, 5);
    } catch (error) {
      // Log any errors that occur while sending the message
      console.error("Error sending message:", error);
    }
  };

  const renderMarkdownToHTML = (value: string) => {
    return value.replace(/^(#+) (.*)$/gm, (match, p1, p2) => `<h${p1.length}>${p2}</h${p1.length}>`)
              .replace(/^(.*)$/gm, (match) => `<p>${match}</p>`)
              .replace(/!\[(.*?)\]\((.*?)\)/g, (match, p1, p2) => `<img src="${p2}" alt="${p1}">`)
              .replace(/\[(.*?)\]\((.*?)\)/g, (match, p1, p2) => `<a href="${p2}">${p1}</a>`)
              .replace(/_(.*?)_/g, (match, p1) => `<em>${p1}</em>`)
              .replace(/\*(.*?)\*/g, (match, p1) => `<strong>${p1}</strong>`);
  }

  // Helper function to render the chat log
  const renderChatLog = (chatLog: ChatLogEntry[]) => {
    return chatLog.map((entry, index) => {
      const html = renderMarkdownToHTML(entry.response);

      return <div key={index} className="flex justify-between items-start mb-4">
        <div>
          <span className="block text-blue-500">You: {entry.message}</span>
          <span className="block text-gray-600" dangerouslySetInnerHTML={{ __html: html }}></span>
        </div>
        <span className="text-gray-400 text-sm">{entry.timestamp}</span>
        {isSending && (
          <div className="text-gray-400 text-sm">
            <span className="animate-pulse">thinking...</span>
          </div>
        )}
      </div>
    });
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full">
        <div className="chat-log w-full">{renderChatLog(chatLog)}</div>
        <textarea
          ref={textAreaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !isSending) {
              handleSendMessage();
            }
          }}
          placeholder="Type your message here..."
          autoFocus
          disabled={isSending}
          className="w-full h-24 p-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSendMessage}
          disabled={isSending || message.trim() === ""}
          className="bg-black text-white py-2 px-4 rounded-lg text-right"
        >
          Send
        </button>
      </main>
    </div>
  );
}