FROM node:21-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5173

# Add host flag to vite command to allow external connections
CMD ["npm", "run", "dev"]