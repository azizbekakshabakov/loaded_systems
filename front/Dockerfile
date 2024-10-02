# Use a base image with Node.js installed
FROM node:20 AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Build the AngularJS app
RUN npm run build



# Use an official Apache runtime as a parent image
FROM httpd

# Set the working directory inside the container
WORKDIR /usr/local/apache2/htdocs

# Copy the built AngularJS project into the container
COPY --from=builder /app/dist/front/browser/ .

# Expose port 80 to the outside world
EXPOSE 80