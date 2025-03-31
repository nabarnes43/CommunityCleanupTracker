FROM node:16

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies including devDependencies
RUN npm install && \
    npm install firebase-admin axios express-request-id @google-cloud/secret-manager

# Copy server source code
COPY . .

# Set environment variables
ENV PORT=8080
ENV NODE_ENV=production

# Your app binds to port 8080 so you'll use the EXPOSE instruction
EXPOSE 8080

# Define the command to run your app
# Using nodemon for development with hot reloading
CMD [ "npm", "run", "dev" ] 