# Use an official Node.js runtime as a parent image
FROM node:21-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json from both client and server
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies for both client and server
RUN npm install --prefix ./client
RUN npm install --prefix ./server

# Copy the rest of the application code from both directories
COPY client ./client
COPY server ./server

# Expose the ports the apps run on
EXPOSE 5000 5173

# Command to run the applications
CMD ["sh", "-c", "npm run dev --prefix ./client & node ./server/index.js"]