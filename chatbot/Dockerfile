# Use an official Node.js image as the base
FROM node:22

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

# Create a script to run the build and start commands
RUN echo "npm run build && npm run start" > start.sh
RUN chmod +x start.sh

# Run the script when the container is launched
CMD ["./start.sh"]