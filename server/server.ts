/**
 * Server entry point.
 * 
 * This file sets up an Express server to handle incoming chat requests.
 * It uses the workflow defined in `workflow.ts` to process the requests.
 */

import { createServer, config } from './serverConfig';
import { llmApp } from './chain/workflow';

/**
 * Create the Express server.
 * 
 * This function creates a new Express server instance and configures it
 * with the necessary middleware and routes.
 */
const app = createServer();

/**
 * Handle incoming chat requests.
 * 
 * This function handles incoming POST requests to the `/chat` endpoint.
 * It expects a JSON body with a `message` property, which is passed to the
 * workflow for processing.
 */
app.post('/chat', async (req: any, res: any) => {
  // Get the message from the request body
  const message = req.body.message;

  // Check if the message is empty
  if (!message) {
    // Return a 400 error if the message is empty
    return res.status(400).json({ error: "No message provided" });
  }

  try {
    // Log the incoming message
    console.log("Message", message);

    // Invoke the workflow with the message
    const response = await llmApp.invoke({ messages: [{role: "user", content: message}] }, config);

    // Log the response from the workflow
    console.log("Response", response);

    // Return the response to the client
    res.json(response);
  } catch (error) {
    // Log any errors that occur during processing
    console.error("Error during chat:", error);

    // Return a 500 error to the client
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Start the server.
 * 
 * This function starts the Express server listening on the specified port.
 */
app.listen(app.get('port'), () => {
  // Log a message to indicate that the server is running
  console.log(`Server is running on port ${app.get('port')}`);
});