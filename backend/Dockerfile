FROM node:18-bullseye

# Install LibreOffice, python-uno, and required fonts
RUN apt-get update && apt-get install -y \
    libreoffice \
    python3-uno \
    fonts-liberation \
    fonts-croscore \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files and install dependencies
COPY package.json ./
RUN npm install

# Copy application files
COPY server.js convert.py ./

# Expose port
EXPOSE 3001

# Start the server
CMD ["npm", "start"]
