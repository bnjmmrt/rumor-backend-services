# Use the latest Node.js image as the base
FROM node:alpine

# Expose the port that the service will be running on
EXPOSE 8000

WORKDIR /app

# Copy rumor-utils to the working directory
COPY ../rumor-utils rumor-utils

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY src src

# Build the application
RUN npm run build

# Start the service
CMD ["node", "dist/index.js"]
