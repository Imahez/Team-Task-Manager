const db = require('../db');

exports.getGlobalDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Total tasks across all user's projects
    const totalTasksRes = await db.query(`
      SELECT COUNT(t.id) as count 
      FROM tasks t
      JOIN project_members pm ON t.project_id = pm.project_id
      WHERE pm.user_id = $1
    `, [userId]);

    // Overdue tasks
    const overdueRes = await db.query(`
      SELECT COUNT(t.id) as count 
      FROM tasks t
      JOIN project_members pm ON t.project_id = pm.project_id
      WHERE pm.user_id = $1 AND t.due_date < CURRENT_DATE AND t.status != 'done'
    `, [userId]);

    // My assigned tasks
    const myAssignedRes = await db.query(`
      SELECT COUNT(t.id) as count 
      FROM tasks t
      JOIN project_members pm ON t.project_id = pm.project_id
      WHERE pm.user_id = $1 AND t.assigned_to = $1 AND t.status != 'done'
    `, [userId]);

    // Due this week (between today and +7 days)
    const dueThisWeekRes = await db.query(`
      SELECT COUNT(t.id) as count 
      FROM tasks t
      JOIN project_members pm ON t.project_id = pm.project_id
      WHERE pm.user_id = $1 AND t.assigned_to = $1 AND t.status != 'done' AND t.due_date >= CURRENT_DATE AND t.due_date <= CURRENT_DATE + interval '7 days'
    `, [userId]);

    res.json({
      totalTasks: parseInt(totalTasksRes.rows[0].count),
      overdueTasks: parseInt(overdueRes.rows[0].count),
      myAssignedTasks: parseInt(myAssignedRes.rows[0].count),
      tasksDueThisWeek: parseInt(dueThisWeekRes.rows[0].count)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};
