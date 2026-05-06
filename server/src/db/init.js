const fs = require('fs');
const path = require('path');
const { pool } = require('./index');

async function initDB() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  try {
    console.log('Running schema migration...');
    await pool.query(sql);
    console.log('Schema migration completed successfully.');
  } catch (error) {
    console.error('Error executing schema migration:', error);
  } finally {
    pool.end();
  }
}

initDB();
