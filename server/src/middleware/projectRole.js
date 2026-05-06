const db = require('../db');

function requireProjectRole(allowedRoles) {
  return async (req, res, next) => {
    try {
      const projectId = req.params.id || req.params.projectId;
      const userId = req.user.id;

      // Check membership
      const memberRes = await db.query(
        'SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2',
        [projectId, userId]
      );

      if (memberRes.rows.length === 0) {
        return res.status(403).json({ error: 'Access denied: not a member of this project' });
      }

      const membership = memberRes.rows[0];

      // Check if role is allowed
      if (!allowedRoles.includes(membership.role) && !allowedRoles.includes('any')) {
        return res.status(403).json({ error: 'Access denied: insufficient permissions' });
      }

      // Get project details
      const projectRes = await db.query('SELECT * FROM projects WHERE id = $1', [projectId]);
      if (projectRes.rows.length === 0) {
        return res.status(404).json({ error: 'Project not found' });
      }

      req.project = projectRes.rows[0];
      req.membership = membership;
      next();
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Server Error' });
    }
  };
}

module.exports = requireProjectRole;
