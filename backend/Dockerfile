# Use Node.js LTS version as base image
FROM node:20-slim

# Install system dependencies required for canvas, TensorFlow.js, and native builds
RUN apt-get update && apt-get install -y \
    python3 \
    build-essential \
    curl \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Clean install and force rebuild of native modules
RUN npm install --unsafe-perm && \
    npm rebuild @tensorflow/tfjs-node --build-from-source && \
    npm rebuild canvas --build-from-source

# Copy the rest of the source code
COPY . .

# Build TypeScript code
RUN npm run build

# Expose port
EXPOSE 5002

# Start the application
CMD ["node", "dist/server.js"]