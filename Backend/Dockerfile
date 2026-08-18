FROM node:22-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run db:generate && npm prune --omit=dev

ENV NODE_ENV=production
EXPOSE 5000
CMD ["npm", "start"]
