FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
# Fly даст порт через переменную
ENV PORT=3000
EXPOSE 3000
CMD ["npm", "start"]
