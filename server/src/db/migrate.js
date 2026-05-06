const fs = require('fs');
const path = require('path');
const { pool } = require('./index');

async function migrate() {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Running database migrations...');
    await pool.query(schema);
    console.log('Database migrations completed successfully.');
  } catch (err) {
    console.error('Error running database migrations:', err);
    throw err;
  }
}

module.exports = migrate;
