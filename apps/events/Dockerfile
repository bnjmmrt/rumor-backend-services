FROM node:latest

WORKDIR /app

# Copy rumor-utils to the working directory
COPY rumor-utils rumor-utils

# Copy package.json and package-lock.json to the working directory
COPY apps/events/package*.json .
COPY apps/events/tsconfig.json .

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY apps/events/src src

# Build the application
RUN npm run build

EXPOSE 8001

# Start the service
CMD ["node", "/app/dist/src/index.js"]