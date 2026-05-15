FROM node:22-alpine

WORKDIR /app

COPY package.json ./
COPY . .

ENV HOST=0.0.0.0

EXPOSE 8787

CMD ["node", "server.js"]
