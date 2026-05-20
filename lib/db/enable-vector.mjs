import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  try {
    console.log("Enabling vector extension...");
    await pool.query('CREATE EXTENSION IF NOT EXISTS vector;');
    console.log("Vector extension enabled!");
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
