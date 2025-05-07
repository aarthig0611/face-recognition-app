# Use Node.js as the base image
FROM node:latest

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY ./package.json ./package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY ./ ./

# Expose the port that React development server will run on
EXPOSE 3000

# Start the React development server
CMD ["npm", "start"]