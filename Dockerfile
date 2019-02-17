FROM node:11-alpine
COPY package.json .
RUN npm set progress=false
RUN npm install --only=production
COPY ./src ./src
COPY ./bin ./bin
COPY ./client-static ./client-static
COPY ./client-templated ./client-templated
ENTRYPOINT [ "./bin/cli.js" ]
