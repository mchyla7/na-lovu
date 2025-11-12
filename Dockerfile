# Na lovu – Node + Socket.IO
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Install dependencies first (better layer cache)
COPY package.json package-lock.json* ./
RUN npm ci || npm install --no-audit --no-fund

# Copy source
COPY src ./src
COPY public ./public

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["npm", "start"]
