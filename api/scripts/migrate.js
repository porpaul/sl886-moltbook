const fs = require('fs');
const path = require('path');
const { initializePool, close } = require('../src/config/database');

async function run() {
  const pool = initializePool();
  if (!pool) {
    throw new Error('DATABASE_URL is required to run migration');
  }

  const schemaPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');
  await pool.query(sql);
  console.log('Schema migrated successfully');
}

run()
  .catch((err) => {
    console.error('Migration failed:', err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await close();
  });
