# e621 Proxy for Old Mobile Browsers

A simple proxy/frontend for e621 that works on old mobile browsers like Opera Mini on Nokia 215 4G.

## Features

- **Simple HTML interface** - Works on browsers with limited JavaScript support
- **Search by tags** - Search for posts with multiple tags
- **Browse posts** - Paginated post listings
- **View individual posts** - See full details and tags
- **Random post** - Get a random post
- **Docker support** - Easy deployment with docker-compose

## Quick Start

```bash
# Clone the repository
git clone https://github.com/ollieisonline/e621proxy.git
cd e621proxy

# Start with Docker Compose
docker-compose up -d

# Access the proxy at http://localhost:3000
```

## Usage

1. Open your browser and navigate to the proxy URL
2. Use the search box to search for posts by tags
3. Browse through pages of results
4. Click on any post to view it in detail

### Search Examples

- `rating:safe furry` - Safe furry posts
- `rating:questionable wolf` - Questionable wolf posts
- `character:sonic` - Posts with Sonic character
- `artist:blotch` - Posts by artist blotch
- `copyright:sonic_the_hedgehog` - Sonic copyright posts

## Configuration

The proxy runs on port 3000 by default. You can change this by:

1. Editing the `PORT` environment variable in `docker-compose.yml`
2. Or setting it when running: `PORT=8080 docker-compose up -d`

## Requirements

- Docker and Docker Compose
- Node.js 18+ (if running without Docker)

## Running Without Docker

```bash
npm install
npm start
```

The server will start on port 3000.

## Browser Compatibility

This proxy is designed to work with:
- Opera Mini (all versions)
- Nokia 215 4G browser
- Other old mobile browsers with limited JavaScript
- Any browser that supports basic HTML 4.01

## Notes

- This is a **read-only** proxy. You cannot upload or modify content.
- All content is fetched from e621.net
- The proxy adds minimal overhead to requests
- Images are served directly from e621 CDN

## License

MIT
