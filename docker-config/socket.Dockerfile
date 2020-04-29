FROM node:12-stretch

USER node

RUN mkdir /home/node/code

WORKDIR /home/node/code

COPY --chown=node:node package.json yarn.lock ./

RUN yarn

COPY --chown=node:node . .

RUN yarn build:socket

CMD ["node", "dist/apps/socket/main.js"]
