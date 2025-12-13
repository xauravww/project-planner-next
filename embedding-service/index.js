const express = require('express');
const { pipeline } = require('@xenova/transformers');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

let embeddingPipeline = null;

async function initEmbeddings() {
  if (!embeddingPipeline) {
    embeddingPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return embeddingPipeline;
}

app.post('/generate-embeddings', async (req, res) => {
  try {
    const { text, table, id } = req.body;
    console.log('Received request:', { text: text.substring(0, 50), table, id });

    if (!text || !table || !id) {
      return res.status(400).json({ error: 'Missing required fields: text, table, id' });
    }

    console.log('Initializing embeddings...');
    const pipe = await initEmbeddings();
    console.log('Generating embedding...');
    const output = await pipe(text, { pooling: 'mean', normalize: true });
    const embedding = Array.from(output.data);
    console.log('Embedding generated, length:', embedding.length);

    // Store directly in database
    const query = `UPDATE "${table}" SET embedding_vector = $1 WHERE id = $2`;
    console.log('Executing query:', query, id);
    const result = await pool.query(query, [JSON.stringify(embedding), id]);
    console.log('Query result:', result.rowCount);

    res.json({ success: true, message: 'Embedding generated and stored' });
  } catch (error) {
    console.error('Error generating embedding:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/generate-embedding', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Missing text' });
    }

    const pipe = await initEmbeddings();
    const output = await pipe(text, { pooling: 'mean', normalize: true });
    const embedding = Array.from(output.data);

    res.json({ embedding });
  } catch (error) {
    console.error('Error generating embedding:', error);
    res.status(500).json({ error: 'Failed to generate embedding' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Embedding service running on port ${PORT}`);
});