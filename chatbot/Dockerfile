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

# Expose the port that the Next.js app will listen on
EXPOSE 3000

# Run the command to start the Next.js app when the container is launched to run it in production mode
CMD ["npm", "run", "build"] && ["npm", "run", "start"]