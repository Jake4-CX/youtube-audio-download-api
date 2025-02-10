# syntax=docker/dockerfile:1
FROM node:18-alpine

# Set environment variables
ARG REST_PORT
ENV REST_PORT=$REST_PORT

ARG YOUTUBE_API_KEY
ENV YOUTUBE_API_KEY=$YOUTUBE_API_KEY

ARG BACKBLAZE_ENDPOINT
ENV BACKBLAZE_ENDPOINT=$BACKBLAZE_ENDPOINT

ARG BACKBLAZE_ACCOUNT_ID
ENV BACKBLAZE_ACCOUNT_ID=$BACKBLAZE_ACCOUNT_ID

ARG BACKBLAZE_APP_KEY
ENV BACKBLAZE_APP_KEY=$BACKBLAZE_APP_KEY

ARG BACKBLAZE_BUCKET_NAME
ENV BACKBLAZE_BUCKET_NAME=$BACKBLAZE_BUCKET_NAME

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

# Optionally create a .env file with all the environment variables
RUN echo "REST_PORT=$REST_PORT" >> .env && \
    echo "YOUTUBE_API_KEY=$YOUTUBE_API_KEY" >> .env && \
    echo "BACKBLAZE_ENDPOINT=$BACKBLAZE_ENDPOINT" >> .env && \
    echo "BACKBLAZE_ACCOUNT_ID=$BACKBLAZE_ACCOUNT_ID" >> .env && \
    echo "BACKBLAZE_APP_KEY=$BACKBLAZE_APP_KEY" >> .env && \
    echo "BACKBLAZE_BUCKET_NAME=$BACKBLAZE_BUCKET_NAME" >> .env && \
    echo "DATABASE_URL=$DATABASE_URL" >> .env

WORKDIR /app

# Install necessary packages, including Python and ffmpeg
RUN apk add --no-cache \
    openssl \
    zlib \
    libgcc \
    libstdc++ \
    musl \
    python3 \
    py3-pip \
    ffmpeg

# Copy and install dependencies
COPY package.json package-lock.json* ./
RUN npm install --production

# Copy application code
COPY . ./
COPY prisma/schema.prisma ./prisma/

# Ensure database is set up correctly
RUN npx prisma db push
RUN npx prisma generate
RUN npm run build

# Start application
CMD ["node", "-r", "tsconfig-paths/register", "build/index.js"]