# Use official Node.js LTS image as the base
FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install 

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
