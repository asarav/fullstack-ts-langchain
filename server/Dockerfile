# Use an official Node.js image as the base
FROM node:16

# Set the working directory to /app
WORKDIR /app

# Copy the package*.json files to the working directory
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the application code to the working directory
COPY . .

# Expose the port that the Express server will listen on
EXPOSE 3001

# Run the command to start the Express server when the container is launched
CMD ["npm", "start"]