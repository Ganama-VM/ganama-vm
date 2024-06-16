FROM node:20
WORKDIR /usr/src/app
COPY . .
RUN npm install pm2 -g
RUN yarn install

CMD ["pm2-runtime", "start", "/usr/src/app/index.js"]
