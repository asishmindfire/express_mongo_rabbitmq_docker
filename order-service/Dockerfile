FROM node:alpine
WORKDIR /app
COPY package*.json ./

# COPY
COPY . ./

RUN npm install

# A command to start the server
CMD ["npm", "start"]