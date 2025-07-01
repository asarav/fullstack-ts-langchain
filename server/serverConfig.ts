// Import required modules
import express from "express"; // Import Express.js framework
import cors from "cors"; // Import CORS middleware
import dotenv from "dotenv"; // Import dotenv for environment variable management
import { v4 as uuidv4 } from "uuid"; // Import UUID library for generating unique IDs

// Load environment variables from .env file
dotenv.config();

// Set the port number for the server to listen on
// If PORT environment variable is not set, default to 3001
const port = process.env.EXPRESS_PORT || 3001;

// Define a function to create an Express server instance
const createServer = () => {
  // Create a new Express app instance
  const app = express();

  // Enable CORS middleware to allow cross-origin requests
  app.use(cors());

  // Enable JSON parsing middleware to parse incoming request bodies
  app.use(express.json());

  // Set the port number for the server to listen on
  app.set("port", port);

  // Return the configured Express app instance
  return app;
};

// Define a configuration object with a unique thread ID
const config = {
  configurable: {
    // Generate a unique thread ID using UUID library
    thread_id: uuidv4(),
  },
};

// Export the createServer function and config object
export { createServer, config };
