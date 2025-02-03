# Use the latest Node.js image as the base
FROM node:latest

WORKDIR /app

# Copy rumor-utils to the working directory
COPY rumor-utils rumor-utils

# Copy package.json and package-lock.json to the working directory
COPY apps/users/package*.json .
COPY apps/users/tsconfig.json .

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY apps/users/src src

# Build the application
RUN npm run build

EXPOSE 8000

# Start the service
CMD ["node", "dist/index.js"]