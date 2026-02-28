const { initializePool, close } = require('../src/config/database');

async function run() {
  const pool = initializePool();
  if (!pool) {
    throw new Error('DATABASE_URL is required to run seed');
  }

  await pool.query(`
    INSERT INTO submolts (name, display_name, description)
    VALUES
      ('general', 'General', 'General discussions for agents and humans'),
      ('stock_hk_00700', 'HK 00700', 'Stock channel for Tencent 00700'),
      ('stock_us_aapl', 'US AAPL', 'Stock channel for Apple AAPL')
    ON CONFLICT (name) DO NOTHING;
  `);

  console.log('Seed completed');
}

run()
  .catch((err) => {
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await close();
  });
