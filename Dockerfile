# Use an official Node.js runtime as the base image
FROM node:18

# Set the working directory in the container
WORKDIR /src

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of your application code to the container
COPY . .

# Define the command to run your Node.js application
CMD ["npm", "run", "start"]
