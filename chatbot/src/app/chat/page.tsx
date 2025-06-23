"use client";
import { useState, useRef, useEffect } from "react";
import { generateChatResponse, generateAgentResponse, fetchChatHistory } from "./api/api";
// Define the ChatLogEntry interface
interface ChatLogEntry {
  message: string;
  response: string;
  timestamp: string;
}

// Define the Home component
export default function Home() {
  // State variables
  const [chatLog, setChatLog] = useState<ChatLogEntry[]>([]);
  const [message, setMessage] = useState<string>("");
  const [isSending, setIsSending] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState('agent');
  const [messageSent, setMessageSent] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const conversationId = 'some-conversation-id'; // Replace with the actual conversation ID

  // Load chat history when the component mounts
  useEffect(() => {
    console.log("LOADING CHAT HISTORY");
    //loadChatHistory();
  }, [conversationId]);

  // Function to load chat history
  const loadChatHistory = async () => {
    try {
      const response = await fetchChatHistory(conversationId);
      const chatHistory = response?.data;
      if (!chatHistory) {
        console.log("No chat history found");
        return;
      }
      const chatLogEntries = [];
      for (let i = 0; i < chatHistory.length; i++) {
        const entry = chatHistory[i];
        if (entry.role === "user") {
          chatLogEntries.push({
            message: entry.content,
            response: '',
            timestamp: new Date().toLocaleTimeString(),
          });
        } else {
          if (chatLogEntries.length > 0 && chatLogEntries[chatLogEntries.length - 1].response === '') {
            chatLogEntries[chatLogEntries.length - 1].response = entry.content;
          } else {
            // This should never happen, but just in case
            console.log("Warning: response without corresponding message");
          }
        }
      }
      setChatLog(chatLogEntries);
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  // Function to handle sending a message
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
      // Send the message to the selected endpoint
      const req = {
        body: {
          message,
          conversationId,
        },
      };

      const response = await (selectedEndpoint === 'agent' ? generateAgentResponse : generateChatResponse)(req);

      // Log the response from the API
      console.log("RESPONSE");
      console.log(response?.data);

      // Get the response text from the API
      console.log(response);
      const responseText = response?.data?.messages[response.data?.messages.length - 1]?.kwargs?.content;
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
          setMessageSent(true); // Set messageSent to true
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
      return (
        <div key={index} className="flex justify-between items-start mb-4">
          <div className="text-lg">
            <span className="block text-blue-500">You: {entry.message}</span>
            <span className="block text-gray-600">{entry.response}</span>
          </div>
          <span className="text-gray-400 text-sm ml-auto">{entry.timestamp}</span>
          {index === chatLog.length - 1 && isSending && (
            <div className="text-gray-400 text-sm ml-auto">
              <span className="animate-pulse">thinking...</span>
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] pl-4 pr-4">
      <main className="flex flex-col row-start-1 sm:items-start w-full">
        <div className="chat-log w-full bg-gray-950 p-4 rounded-lg h-140 overflow-y-auto border border-gray-700">{renderChatLog(chatLog)}</div>
        <div className="fixed bottom-10 left-0 right-0 pt-4 pl-4 pr-4">
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
          <div className="flex justify-center mt-4">
            <select
              value={selectedEndpoint}
              onChange={(e) => setSelectedEndpoint(e.target.value)}
              disabled={messageSent}
              className={`w-32 h-12 pl-4 pr-10 py-2 mr-4 text-lg text-white bg-gray-950 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 ${messageSent ? 'cursor-not-allowed' : ''}`}
            >
              <option value="agent">Agent</option>
              <option value="chat">Chat</option>
            </select>
            <button
              onClick={handleSendMessage}
              disabled={isSending || message.trim() === ""}
              className={`bg-black text-white h-12 py-2 px-4 mr-4 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300 ${(isSending || message.trim() === "") ? 'cursor-not-allowed' : ''}`}
            >
              Send
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}