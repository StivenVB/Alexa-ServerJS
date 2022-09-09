FROM node:14-alpine
    
    

    # Install Dependencies and Copy Source Files
    
    RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
    WORKDIR /home/node/app    
    COPY package*.json ./
    COPY . .
    USER node
    RUN npm install --only=prod

    # Set Up the App to Run
    EXPOSE 4000
    CMD [ "npm", "start" ]