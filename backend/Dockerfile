# Use the official Node.js LTS image
FROM node:20

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies (including native modules)
RUN npm install

# Copy the rest of your backend code
COPY . .

# Build TypeScript (if needed)
RUN npm run build

# Expose the port (use the same as your app, typically 5002)
EXPOSE 5002

# Start the server
CMD [ "npm", "start" ]
