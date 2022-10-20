FROM node:12

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV PORT=9999

EXPOSE 9999

CMD ["npm", "start"]