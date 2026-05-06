const db = require('../db');

exports.getTasks = async (req, res) => {
  const { status, assignedTo, priority } = req.query;
  let queryStr = `
    SELECT t.*, u.name as assignee_name, u.email as assignee_email,
           (t.due_date < CURRENT_DATE AND t.status != 'done') as "isOverdue"
    FROM tasks t
    LEFT JOIN users u ON t.assigned_to = u.id
    WHERE t.project_id = $1
  `;
  const params = [req.project.id];
  let paramIndex = 2;

  if (status) {
    queryStr += ` AND t.status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }
  if (assignedTo) {
    queryStr += ` AND t.assigned_to = $${paramIndex}`;
    params.push(assignedTo);
    paramIndex++;
  }
  if (priority) {
    queryStr += ` AND t.priority = $${paramIndex}`;
    params.push(priority);
    paramIndex++;
  }

  queryStr += ` ORDER BY t.created_at DESC`;

  try {
    const result = await db.query(queryStr, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.createTask = async (req, res) => {
  const { title, description, status, priority, assigned_to, due_date } = req.body;
  try {
    if (assigned_to) {
      const memberCheck = await db.query(
        'SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2',
        [req.project.id, assigned_to]
      );
      if (memberCheck.rows.length === 0) {
        return res.status(400).json({ error: 'Assigned user is not a member of this project' });
      }
    }

    const result = await db.query(
      `INSERT INTO tasks (project_id, title, description, status, priority, assigned_to, created_by, due_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [req.project.id, title, description, status || 'todo', priority || 'medium', assigned_to || null, req.user.id, due_date || null]
    );

    const createdTask = await db.query(
      `SELECT t.*, u.name as assignee_name, u.email as assignee_email,
              (t.due_date < CURRENT_DATE AND t.status != 'done') as "isOverdue"
       FROM tasks t LEFT JOIN users u ON t.assigned_to = u.id WHERE t.id = $1`,
      [result.rows[0].id]
    );

    res.json(createdTask.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.updateTask = async (req, res) => {
  const taskId = req.params.taskId;
  const { title, description, status, priority, assigned_to, due_date } = req.body;

  try {
    const taskRes = await db.query('SELECT * FROM tasks WHERE id = $1 AND project_id = $2', [taskId, req.project.id]);
    if (taskRes.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    const task = taskRes.rows[0];

    // Permissions check
    if (req.membership.role !== 'admin') {
      if (task.assigned_to !== req.user.id && task.created_by !== req.user.id) {
        return res.status(403).json({ error: 'Members can only update tasks assigned to them or created by them' });
      }
    }

    if (assigned_to && assigned_to !== task.assigned_to) {
      const memberCheck = await db.query(
        'SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2',
        [req.project.id, assigned_to]
      );
      if (memberCheck.rows.length === 0) {
        return res.status(400).json({ error: 'Assigned user is not a member of this project' });
      }
    }

    const result = await db.query(
      `UPDATE tasks 
       SET title = COALESCE($1, title), 
           description = COALESCE($2, description), 
           status = COALESCE($3, status), 
           priority = COALESCE($4, priority), 
           assigned_to = $5, 
           due_date = COALESCE($6, due_date)
       WHERE id = $7 RETURNING *`,
      [title, description, status, priority, assigned_to !== undefined ? assigned_to : task.assigned_to, due_date, taskId]
    );

    const updatedTask = await db.query(
      `SELECT t.*, u.name as assignee_name, u.email as assignee_email,
              (t.due_date < CURRENT_DATE AND t.status != 'done') as "isOverdue"
       FROM tasks t LEFT JOIN users u ON t.assigned_to = u.id WHERE t.id = $1`,
      [taskId]
    );

    res.json(updatedTask.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.deleteTask = async (req, res) => {
  const taskId = req.params.taskId;

  try {
    const taskRes = await db.query('SELECT * FROM tasks WHERE id = $1 AND project_id = $2', [taskId, req.project.id]);
    if (taskRes.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    const task = taskRes.rows[0];

    // Permissions check
    if (req.membership.role !== 'admin') {
      if (task.created_by !== req.user.id) {
        return res.status(403).json({ error: 'Members can only delete tasks created by them' });
      }
    }

    await db.query('DELETE FROM tasks WHERE id = $1', [taskId]);
    res.json({ msg: 'Task deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.getProjectDashboard = async (req, res) => {
  try {
    const totalRes = await db.query('SELECT COUNT(*) as count FROM tasks WHERE project_id = $1', [req.project.id]);
    const statusRes = await db.query('SELECT status, COUNT(*) as count FROM tasks WHERE project_id = $1 GROUP BY status', [req.project.id]);
    const priorityRes = await db.query('SELECT priority, COUNT(*) as count FROM tasks WHERE project_id = $1 GROUP BY priority', [req.project.id]);
    const overdueRes = await db.query("SELECT COUNT(*) as count FROM tasks WHERE project_id = $1 AND due_date < CURRENT_DATE AND status != 'done'", [req.project.id]);
    const myTasksRes = await db.query('SELECT COUNT(*) as count FROM tasks WHERE project_id = $1 AND assigned_to = $2', [req.project.id, req.user.id]);
    const recentRes = await db.query('SELECT * FROM tasks WHERE project_id = $1 ORDER BY updated_at DESC LIMIT 5', [req.project.id]);

    const stats = {
      totalTasks: parseInt(totalRes.rows[0].count),
      byStatus: { todo: 0, in_progress: 0, done: 0 },
      byPriority: { low: 0, medium: 0, high: 0 },
      overdueTasks: parseInt(overdueRes.rows[0].count),
      myAssignedTasks: parseInt(myTasksRes.rows[0].count),
      recentTasks: recentRes.rows
    };

    statusRes.rows.forEach(r => stats.byStatus[r.status] = parseInt(r.count));
    priorityRes.rows.forEach(r => stats.byPriority[r.priority] = parseInt(r.count));

    res.json(stats);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};
