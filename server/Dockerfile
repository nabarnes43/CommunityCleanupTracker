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
ENV GOOGLE_CLOUD_PROJECT=gmail-api-test-427120

# Add debug logs to container startup
RUN echo "set -x" > /startup.sh && \
    echo "echo 'Starting container...'" >> /startup.sh && \
    echo "echo 'Environment: NODE_ENV='\$NODE_ENV" >> /startup.sh && \
    echo "echo 'Port: PORT='\$PORT" >> /startup.sh && \
    echo "npm start" >> /startup.sh && \
    chmod +x /startup.sh

# Your app binds to port 8080 so you'll use the EXPOSE instruction
EXPOSE 8080

# Define the command to run your app
# Using npm start to run the application
CMD [ "npm", "start" ] 