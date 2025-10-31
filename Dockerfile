FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# If you have a package-lock.json, uncomment the following line
COPY tsconfig.json ./
COPY src ./src

# Build the application
RUN npm run build

# Copy static files
COPY public ./public
COPY data ./data

ENV PORT=3000
EXPOSE 3000

CMD ["npm", "start"]
