# syntax=docker/dockerfile:1
FROM node:18-alpine AS base
WORKDIR /app

# Install dependencies only from package.json
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev || npm install --omit=dev

# Copy source
COPY . .

EXPOSE 3000
CMD ["npm", "start"]

