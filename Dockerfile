# ================================
# Stage 1: Build the Client
# ================================
FROM node:21-alpine AS client-builder
WORKDIR /client

# Copy package files and install dependencies
COPY client/package.json client/package-lock.json* ./
RUN npm install --force

# Copy the client source code and .env file
COPY client/ .

# Build the client (output to /client/dist)
RUN npm run build

# ================================
# Stage 2: Build the Server
# ================================
FROM node:21-alpine AS server-builder
WORKDIR /server

# Copy package files and install dependencies
COPY server/package.json server/package-lock.json* ./
RUN npm install

# Copy the rest of the server code and .env file
COPY server/ .
COPY server/.env .env

# ================================
# Stage 3: Production Image (Integrated)
# ================================
FROM node:21-alpine
WORKDIR /app

# Copy the built client artifacts into the "public" folder
COPY --from=client-builder /client/dist ./public

# Copy the server code (and its dependencies)
COPY --from=server-builder /server ./

# (Optional) Copy environment files if needed
COPY server/.env server/.env

# Expose only the backend port
EXPOSE 5000

# Start the server (which serves both API and static files)
CMD ["node", "index.js"]