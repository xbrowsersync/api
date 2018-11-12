FROM node:8-slim

# Set environment variables
ENV XBROWSERSYNC_DB_USER ${XBROWSERSYNC_DB_USER}
ENV XBROWSERSYNC_DB_PWD ${XBROWSERSYNC_DB_PWD}

# Create api directory
WORKDIR /usr/src/xbrowsersync-api

# Copy src files
COPY . .

# Install dependencies
RUN npm install

# Expose port and start application
EXPOSE 8080
CMD [ "node", "dist/api.js"]
