FROM node:20-bullseye-slim
WORKDIR /app
COPY package*.json tsconfig.json ./
COPY src ./src
COPY index.html ./
RUN npm install
RUN npm run build
# serve with simple static server in dev; for Docker dev we'll still run vite
EXPOSE 5173
CMD ["npm","run","dev"]
