FROM node:22-alpine
WORKDIR /app
COPY package.json .
COPY server.js .
COPY src/ ./src/
COPY public/ ./public/
COPY .env.example .env.example
EXPOSE 3000
CMD ["node", "server.js"]
