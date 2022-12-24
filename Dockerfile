# First Stage: Build the App
FROM node:19.3.0-alpine3.17 AS builder

WORKDIR /usr/src/bmi-calculator

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Second Stage: Serve the App using nginX as a HTTP Server
FROM nginx:1.23.3-alpine

COPY --from=builder /usr/src/bmi-calculator/build /usr/share/nginx/html

EXPOSE 80
