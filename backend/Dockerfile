FROM node:20-bullseye-slim
WORKDIR /app
COPY package*.json tsconfig.json ./
COPY src ./src
COPY migrations ./migrations
RUN npm install
RUN npm run build
EXPOSE 4000
CMD ["node","dist/server.js"]
