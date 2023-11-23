# base
FROM node:20.9.0 AS base

WORKDIR /usr/src/app

COPY package*.json ./
    
RUN npm install

COPY . .

# for build

FROM base as builder

WORKDIR /usr/src/app

RUN npm run build

# for production

FROM node:20.9.0-alpine3.18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=production

COPY --from=builder /usr/src/app/dist ./

EXPOSE 8080

ENTRYPOINT ["node","./api.js"]