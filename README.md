# YT-DLP Audio Download API

A Node.js/TypeScript/Express.js API that downloads YouTube audio files (by search or direct URL) using [yt-dlp](https://github.com/yt-dlp/yt-dlp) and stores them in an S3-compatible bucket. Integrates with YouTube's Data API, SQLite (via Prisma).

## Features

- Receive a request with either a YouTube video URL or search query
- Download the audio track using yt-dlp
- Store the downloaded file in Backblaze B2 (or any S3-compatible storage)
- Maintain a record of downloads in an SQLite database

## Requirements

- Node.js (v14 or above)
- An S3-compatible account (e.g., Backblaze B2, AWS S3)
- Valid YouTube API credentials

## Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/Jake4-CX/yt-dlp-api.git
   ```

2. Install dependencies:

   ```sh
   cd yt-dlp-api
   npm install
   ```

3. Generate Prisma client:

   ```sh
   npx prisma generate
   ```

## Enviroment Variables

Create a .env file or set the following variables in your environment:

   ```env
   REST_PORT="8080"
   YOUTUBE_API_KEY=""
   BACKBLAZE_ENDPOINT=""
   BACKBLAZE_ACCOUNT_ID=""
   BACKBLAZE_APP_KEY=""
   BACKBLAZE_BUCKET_NAME=""
   DATABASE_URL="file:./dev.db"
   ```

## Usage

1. You can start the server as a development envioment `npm run dev` or compile and run using:

   ```sh
   npm run build
   npm run start
   ```

   This starts the API on the port defined in your environment (`8080` by default).

2. **Download by URL**  

   Send a `POST` request to `/download/url`:

   ```json
   {
     "videoURL": "https://youtu.be/AcaneopJ5rc"
   }

3. **Download by Title**  

   Send a `POST` request to `/download/title`:

   ```json
   {
     "videoTitle": "Memory Reboot x Distant Echoes x Fainted x Shattered Memories"
   }
   ```

## Database

- Prisma is the chosen ORM to connect to the SQLite database.
- Update schema.prisma as needed and run migrations:

   ```sh
   npx prisma migrate dev
   ```

## Contributing

Open pull requests with clear details if you'd like to contribute. Feel free to file issues for bugs or feature requests.

## License

This project is under the [Creative Commons Attribution-NonCommercial 4.0 International License](LICENSE). See `LICENSE` for more info.
