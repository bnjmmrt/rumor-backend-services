# Use the latest Node.js image as the base
FROM public.ecr.aws/lambda/nodejs:22.2025.01.24.10

WORKDIR /app

# Copy rumor-utils to the working directory
COPY rumor-utils /app/rumor-utils

# Copy package.json and package-lock.json to the working directory
COPY /apps/events/package.json .
COPY /apps/events/tsconfig.json .

RUN rm -rf node_modules package-lock.json

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY /apps/events/src src

# Build the application
RUN npm run build

EXPOSE 8001

# Start the service
CMD ["node", "/app/dist/src/index.js"]