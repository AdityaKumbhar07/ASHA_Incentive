FROM node:18-bullseye

# Install LibreOffice and required fonts for accurate Excel rendering
RUN apt-get update && apt-get install -y \
    libreoffice \
    fonts-liberation \
    fonts-croscore \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files and install dependencies
COPY package.json ./
RUN npm install

# Copy application files
COPY server.js ./

# Expose port
EXPOSE 3001

# Start the server
CMD ["npm", "start"]
