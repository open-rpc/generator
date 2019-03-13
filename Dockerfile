FROM node:11-alpine
COPY package.json .
RUN npm set progress=false
RUN npm install --only=production
COPY ./src ./src
COPY ./bin ./bin
COPY ./templates ./templates
ENTRYPOINT [ "./bin/cli.js" ]
