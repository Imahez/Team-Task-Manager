const db = require('../db');

exports.getProjects = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT p.*, pm.role as user_role,
        (SELECT COUNT(*) FROM project_members WHERE project_id = p.id) as member_count
       FROM projects p
       JOIN project_members pm ON p.id = pm.project_id
       WHERE pm.user_id = $1
       ORDER BY p.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.getProject = async (req, res) => {
  try {
    const membersRes = await db.query(
      `SELECT u.id, u.name, u.email, pm.role, pm.joined_at
       FROM project_members pm
       JOIN users u ON pm.user_id = u.id
       WHERE pm.project_id = $1
       ORDER BY pm.joined_at ASC`,
      [req.project.id]
    );

    res.json({
      ...req.project,
      members: membersRes.rows
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.createProject = async (req, res) => {
  const { name, description } = req.body;
  try {
    await db.query('BEGIN');
    
    const projectRes = await db.query(
      'INSERT INTO projects (name, description, owner_id) VALUES ($1, $2, $3) RETURNING *',
      [name, description, req.user.id]
    );
    const newProject = projectRes.rows[0];

    await db.query(
      "INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, 'admin')",
      [newProject.id, req.user.id]
    );

    await db.query('COMMIT');
    res.json(newProject);
  } catch (err) {
    await db.query('ROLLBACK');
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.updateProject = async (req, res) => {
  const { name, description } = req.body;
  try {
    const result = await db.query(
      'UPDATE projects SET name = COALESCE($1, name), description = COALESCE($2, description) WHERE id = $3 RETURNING *',
      [name, description, req.project.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    if (req.project.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the project owner can delete the project' });
    }
    
    await db.query('DELETE FROM projects WHERE id = $1', [req.project.id]);
    res.json({ msg: 'Project deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};
