FROM node:20
WORKDIR /usr/src/miniature-muster
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "start"]
