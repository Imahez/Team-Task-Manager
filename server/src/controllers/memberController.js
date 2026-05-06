const db = require('../db');

exports.addMember = async (req, res) => {
  const { email, role } = req.body;
  const targetRole = role === 'admin' ? 'admin' : 'member';
  
  try {
    const userRes = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const newUserId = userRes.rows[0].id;

    const existingMember = await db.query(
      'SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2',
      [req.project.id, newUserId]
    );

    if (existingMember.rows.length > 0) {
      return res.status(400).json({ error: 'User is already a member of this project' });
    }

    const newMember = await db.query(
      'INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3) RETURNING *',
      [req.project.id, newUserId, targetRole]
    );

    res.json(newMember.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.updateRole = async (req, res) => {
  const { role } = req.body;
  const targetUserId = req.params.userId;
  const newRole = role === 'admin' ? 'admin' : 'member';

  try {
    if (req.project.owner_id === targetUserId && newRole !== 'admin') {
      return res.status(400).json({ error: 'Cannot downgrade the role of the project owner' });
    }

    const updated = await db.query(
      'UPDATE project_members SET role = $1 WHERE project_id = $2 AND user_id = $3 RETURNING *',
      [newRole, req.project.id, targetUserId]
    );

    if (updated.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found in this project' });
    }

    res.json(updated.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.removeMember = async (req, res) => {
  const targetUserId = req.params.userId;

  try {
    if (req.project.owner_id === targetUserId) {
      return res.status(400).json({ error: 'Cannot remove the project owner' });
    }

    const deleted = await db.query(
      'DELETE FROM project_members WHERE project_id = $1 AND user_id = $2 RETURNING *',
      [req.project.id, targetUserId]
    );

    if (deleted.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json({ msg: 'Member removed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};
