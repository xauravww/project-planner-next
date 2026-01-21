# Embedding Service

This service generates embeddings using @xenova/transformers and stores them directly in PostgreSQL pgvector.

## Setup

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and fill in DATABASE_URL
3. Run: `node index.js`

## API

- `POST /generate-embeddings`: Body { text, table, id } - Generates embedding and stores in DB
- `POST /generate-embedding`: Body { text } - Returns embedding array
- `GET /health`: Health check

## Deployment to Koyeb

1. Push this repo to GitHub
2. Connect Koyeb to GitHub
3. Create new service, select this repo
4. Set environment variables: DATABASE_URL, PORT
5. Deploy

## Vercel Integration

Set EMBEDDING_SERVICE_URL to the Koyeb service URL in Vercel env vars.