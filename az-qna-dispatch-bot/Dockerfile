FROM node:12
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3978
CMD ["node", "index.js"]