FROM node:12-stretch

USER node

RUN mkdir /home/node/code

WORKDIR /home/node/code

COPY --chown=node:node package.json yarn.lock scripts/engine.js ./

RUN yarn

COPY --chown=node:node . .

CMD ["node", "engine.js"]
