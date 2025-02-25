# Use the latest Node.js image as the base
FROM public.ecr.aws/docker/library/node:22-alpine3.20

WORKDIR /app

# Copy and build rumor-utils before installing dependencies
COPY packages/rumor-utils packages/rumor-utils

WORKDIR /app/packages/rumor-utils

RUN npm install && npm run build

# Remove everything except dist, then move dist contents to the root of rumor-utils
RUN find . -mindepth 1 -maxdepth 1 ! -name 'dist' -exec rm -rf {} + && \
    mv dist/* . && \
    rm -rf dist

WORKDIR /app

# Copy necessary files for apps/events
COPY apps/events/package.json  ./
COPY apps/events/tsconfig.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the application source code
COPY apps/events/src src

# Remove previous build artifacts
RUN rm -rf dist

# Build the application
RUN npm run build

EXPOSE 8001

# Start the service
CMD ["npm", "start"]
