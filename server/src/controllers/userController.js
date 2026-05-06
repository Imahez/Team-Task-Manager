const db = require('../db');


exports.getTeamMembers = async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, email, role FROM users ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
