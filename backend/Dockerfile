FROM node:20-slim

# Install openssl for Prisma query engine support
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build

EXPOSE 3000

ENV PORT=3000

ENV NODE_ENV=production

# Deploy database migrations on startup before booting the server
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
