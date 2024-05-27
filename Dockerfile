#BUILDER
FROM node:18-alpine as builder
WORKDIR /app
COPY . .
RUN npm ci \
    && npm run build

RUN npm run build


# DEVELOPMENT
FROM builder as dev
COPY package*.json ./
CMD [ "npm", "run", "start:dev" ]

#PRODUCTION BUILD
FROM builder as prod-build
RUN npm prune --omit=dev

#PRODUCTION
FROM node:18-alpine as prod

# copy from prod-build to /app/dist
# set user to node for security
COPY --chown=node:node --from=prod-build /app/dist /app/dist
COPY --chown=node:node --from=prod-build /app/node_modules /app/node_modules
COPY --chown=node:node --from=prod-build /app/.env /app/.env

ENV NODE_ENV=production
ENTRYPOINT [ "node", "./main.js" ]

WORKDIR /app/dist

CMD [ "" ]
USER node