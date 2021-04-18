FROM node:12.18.3

WORKDIR /app
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install --production
COPY . .
RUN npm run build

EXPOSE $CLIENT_PORT
CMD ["node", "server.js"]
