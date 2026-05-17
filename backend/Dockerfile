FROM mcr.microsoft.com/playwright/node:20-focal
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["node", "src/index.js"]
