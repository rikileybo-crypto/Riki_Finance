FROM mcr.microsoft.com/playwright/node:22-focal
WORKDIR /app
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
COPY package*.json ./
RUN npm install
RUN npx playwright install --with-deps chromium
COPY . .
EXPOSE 3001
CMD ["node", "src/index.js"]
